import AsyncStorage from "@react-native-async-storage/async-storage";
import { addNetworkStateListener, getNetworkStateAsync } from "expo-network";
import queueFactory from "react-native-queue";

import { YawlEvent, YawlView } from "../Yawl.types";
import { Env, YawlApi, yawlApi } from "./api";
import { getDeviceInfo } from "./deviceInfo";
import { generateUUID } from "./generateUUID";

/*

INPUT PARAMETERS:
{
  visitorId: string - visitor id
  visitData: object - extra visit data to be sent to ahoy server
  onTracking: {
    started:   async (event)           - function that will be invoked after tracking start
    succeeded: async (event)           - function that will be invoked when tracking success
    failure:   async (event)           - function that will be invoked when tracking failure (before failed)
    failed:    async (event)           - function that will be invoked if tracking fails
    error:     async ({ name, error }) - function that will be invoked when error occured
  }
  offlineMode: boolean - ONLY FOR TESTING PURPOSES, indicates if you want to test with no internet
}
*/

const JOB_VISITOR = "visitor";
const JOB_TRACKING = "tracking";
type JOB_TYPES = typeof JOB_TRACKING | typeof JOB_VISITOR;
const WORKERS_OPTIONS = {
  timeout: 20000,
  attempts: 1000,
  concurrency: 1,
};
export default class Yawl {
  private visitId: string;
  private visitorId: string;
  private offlineMode: boolean = false;
  private hasInternetAccess: boolean | undefined = true;
  private queue: any;
  private api: YawlApi;
  private baseUrl: string;
  private viewTracker?: () => YawlView;

  constructor({ apiKey, env = "prod" }: { apiKey: string; env?: Env }) {
    this.api = yawlApi({ apiKey, env });
    this.visitId = generateUUID();
    this.visitorId = generateUUID();
    this.baseUrl = `react-native-${apiKey}`;
  }

  init = async () => {
    await this.initConnection();
    await this.initQueue();
    await this.loadVisitorId();
    const data = await this.getVisitData();
    this.createJob(JOB_VISITOR, data);
  };

  track = (event: YawlEvent) => {
    const _event = {
      event: {
        id: generateUUID(),
        visit_token: this.visitId,
        visitor_token: this.visitorId,
        timestamp: new Date().getTime() / 1000.0,
        ...event,
        // properties: this.prepareProperties(event.properties),
      },
    };
    // Send event to all services before ahoy queue
    // await this.onTrackingInvoke("started", event);
    // Create ahoy job and add to queue
    this.createJob(JOB_TRACKING, _event);
    return _event;
  };

  /**
   * Track a view event.
   * `viewTracker` object takes precedence over the `view` parameter.
   * Properties from both `view` and `viewTracker` are merged.
   * If `viewTracker` is not provided, the `view` parameter must contain a page.
   *
   * @param view - Optional view object containing page, title, and properties. Must be set if viewTracker is not provided, otherwise the event will not be sent.
   * @returns the event object with the tracking data.
   */
  trackView = (view?: YawlView) => {
    const trackedView = this.viewTracker?.();
    if (!view?.page && !trackedView?.page) {
      console.warn(
        "Yawl: trackView() - page is required; Either set it in the view param or yawl.setViewTracker(); Event not sent"
      );
      return;
    }
    const _event = {
      event: {
        name: "$view",
        url: this.baseUrl,
        ...view,
        ...trackedView,
        properties: { ...view?.properties, ...trackedView?.properties },
        id: generateUUID(),
        visit_token: this.visitId,
        visitor_token: this.visitorId,
        timestamp: new Date().getTime() / 1000.0,
      },
    };
    this.createJob(JOB_TRACKING, _event);
    return _event;
  };

  setVisitId = async (visitId: string): Promise<void> => {
    this.visitId = visitId;

    if (this.hasInternetAccess) {
      this.trackVisit(await this.getVisitData());
    }
  };

  setViewTracker = (viewTracker: () => YawlView) =>
    (this.viewTracker = viewTracker);

  private async loadVisitorId(): Promise<void> {
    const visitorIdKey = "yawl_visitorId";
    const visitorId = await AsyncStorage.getItem(visitorIdKey);
    if (!visitorId)
      return await AsyncStorage.setItem(visitorIdKey, this.visitorId);

    this.visitorId = visitorId;
  }

  private async getVisitData(): Promise<object> {
    return {
      visit: {
        visit_token: this.visitId,
        visitor_token: this.visitorId,
        ...getDeviceInfo(),
      },
    };
  }

  private initConnection = async () => {
    const state = await getNetworkStateAsync();
    this.hasInternetAccess = state.isConnected;
    addNetworkStateListener(
      (state) => (this.hasInternetAccess = state.isConnected)
    );
  };

  private initQueue = async () => {
    this.queue = await queueFactory(true);
    this.addTrackingWorker();
    this.addVisitorWorker();
  };

  private trackVisit = (event) => this.api.sendVisit(event);

  private createJob = (name: JOB_TYPES, event: object) => {
    if (this.offlineMode) {
      this.hasInternetAccess = false;
    }

    if (this.queue) {
      this.queue.createJob(name, event);
    }
  };

  private prepareProperties = (inter: object) => {
    const properties = {
      // applicationBundleId: this.applicationBundleId,
    };
    Object.keys(inter).map((name, key) => {
      const k = name.replace(/[^a-z0-9_]/gi, "");
      const val = inter[name];
      properties[k] = typeof val === "boolean" ? val.toString() : val;
    });
    return properties;
  };

  private addTrackingWorker = () => {
    this.queue.addWorker(
      JOB_TRACKING,
      async (id, event) => {
        if (this.hasInternetAccess) {
          const res = await this.api.sendEvent(event);
          // TODO: parse response
          console.debug("🚀 ===> ~ res:", res);
          return { ok: true };
        }
        throw new Error("Network request failed");
      },
      {
        onSuccess: async (id, event) => {
          console.debug("🚀 ===> JOB_TRACKING onSuccess", id, event);
          // await this.onTrackingInvoke("succeeded", event);
        },
        onFailure: async (id, event, error) => {
          console.debug("🚀 ===> JOB_TRACKING onFailure", id, event, error);
          // await this.onTrackingInvoke("failure", event, error);
        },
        onFailed: async (id, event, error) => {
          console.debug("🚀 ===> JOB_TRACKING onFailed", id, event, error);
          // await this.onTrackingInvoke("failed", event, error);
        },
        ...WORKERS_OPTIONS,
      }
    );
  };

  private addVisitorWorker = () => {
    this.queue.addWorker(
      JOB_VISITOR,
      async (id, event) => {
        if (this.hasInternetAccess) {
          const res = await this.trackVisit(event);
          // TODO: parse response
          console.debug("🚀 ===> ~ res:", res);
          return { ok: true };
        }

        throw new Error("Network request failed");
      },
      {
        onSuccess: async (id, event) => {
          console.debug("🚀 ===> JOB_VISITOR ~ onSuccess: ~ event:", id, event);
          // await this.onTrackingInvoke("succeeded", event);
        },
        onFailure: async (id, event, error) => {
          console.debug("🚀 ===> JOB_VISITOR ~ onFailure: ~ error:", id, error);
          // await this.onTrackingInvoke("failure", event, error);
        },
        onFailed: async (id, event, error) => {
          console.debug("🚀 ===> JOB_VISITOR ~ onFailed: ~ error:", id, error);
          // await this.onTrackingInvoke("failed", event, error);
        },
        ...WORKERS_OPTIONS,
      }
    );
  };
}
