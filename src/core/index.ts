import NetInfo from "@react-native-community/netinfo";
import queueFactory from "react-native-queue";

import { API_URL, Env, YawlApi, yawlApi } from "./api";
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

  // will be chosen one: trackPosts or trackUrls.
  // if not presented just skip it or should be equal null
  // if two presented, trackPosts will have more priority
  trackPosts: {
    event: async (params) - function that will be invoked when track an event. Individual implementation
    visit: async (params) - function that will be invoked when track a visit.  Individual implementation
  }
  trackUrls: {
    event: string - url for event where request should be sent to
    visit: string - url for visit where request should be sent to
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

// const onTrackingEvents = ["started", "succeeded", "failure", "failed", "error"];
// const trackEvents = ["event", "visit"];
export default class Ahoy {
  private visitId: string;
  private visitorId: string;
  private offlineMode: boolean = false;
  private hasInternetAccess: boolean | null = true;
  private queue: any;
  private apiKey: string;
  private url: string;
  private api: YawlApi;

  constructor({ apiKey, env = "prod" }: { apiKey: string; env?: Env }) {
    this.apiKey = apiKey;
    this.url = API_URL[env];
    this.visitId = generateUUID();
    this.visitorId = generateUUID();
    this.api = yawlApi({ apiKey, env });
  }

  init = async () => {
    await this.initConnection();
    await this.initQueue();

    const data = {
      visit: {
        id: this.visitId,
        visitor_id: this.visitorId,
      },
    };

    this.createJob(JOB_VISITOR, data);
  };

  setVisitId = (visitId: string): void => {
    this.visitId = visitId;

    if (this.hasInternetAccess) {
      this.trackVisit({
        visit: {
          id: this.visitId,
          visitor_id: this.visitorId,
        },
      });
    }
  };

  private initConnection = async () => {
    const state = await NetInfo.fetch();
    this.hasInternetAccess = state.isConnected;
    NetInfo.addEventListener(
      (state) => (this.hasInternetAccess = state.isConnected)
    );
  };

  private initQueue = async () => {
    this.queue = await queueFactory(true);
    this.addTrackingWorker();
    this.addVisitorWorker();
  };

  private trackEvent = async (_event) => {
    const event = Object.assign({}, _event);

    if (event.time) {
      event.timestamp = event.time;
    }

    const trackEvent = {
      event: {
        ...event,
        // applicationBundleId: this.applicationBundleId,
      },
    };

    return this.api.sendEvent(trackEvent);
  };

  private trackVisit = (event) => this.api.sendVisit(event);

  track = (name: string, properties: object = {}) => {
    const event = {
      id: generateUUID(),
      visit_id: this.visitId,
      _visitor_id: this.visitorId,
      timestamp: new Date().getTime() / 1000.0,
      name,
      properties: this.prepareProperties(properties),
    };
    // Send event to all services before ahoy queue
    // await this.onTrackingInvoke("started", event);
    // Create ahoy job and add to queue
    this.createJob(JOB_TRACKING, event);
    return event;
  };

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
          const res = await this.trackEvent(event);
          // TODO: parse response
          console.log("🚀 ===> ~ res:", res);
          return { ok: true };
        }
        throw new Error("Network request failed");
      },
      {
        onSuccess: async (id, event) => {
          console.log("🚀 ===> JOB_TRACKING ~ onSuccess: ~ event:", id);
          // await this.onTrackingInvoke("succeeded", event);
        },
        onFailure: async (id, event, error) => {
          console.log("🚀 ===> JOB_TRACKING ~ onFailure: ~ error:", id, error);
          // await this.onTrackingInvoke("failure", event, error);
        },
        onFailed: async (id, event, error) => {
          console.log("🚀 ===> JOB_TRACKING ~ onFailed: ~ error:", id, error);
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
          console.log("🚀 ===> ~ res:", res);
          return { ok: true };
        }

        throw new Error("Network request failed");
      },
      {
        onSuccess: async (id, event) => {
          console.log("🚀 ===> JOB_VISITOR ~ onSuccess: ~ event:", id, event);
          // await this.onTrackingInvoke("succeeded", event);
        },
        onFailure: async (id, event, error) => {
          console.log("🚀 ===> JOB_VISITOR ~ onFailure: ~ error:", id, error);
          // await this.onTrackingInvoke("failure", event, error);
        },
        onFailed: async (id, event, error) => {
          console.log("🚀 ===> JOB_VISITOR ~ onFailed: ~ error:", id, error);
          // await this.onTrackingInvoke("failed", event, error);
        },
        ...WORKERS_OPTIONS,
      }
    );
  };
}
