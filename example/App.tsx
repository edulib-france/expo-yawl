import Yawl from "@edulib-france/expo-yawl";
import { useEffect, useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";

export const yawl = new Yawl({
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  env: "staging",
});

export default function App() {
  const [isYawlReady, setIsYawlReady] = useState<boolean>(false);
  useEffect(() => {
    yawl.init().then(() => {
      setIsYawlReady(true);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        {/* <Group name="Functions"> */}
        {/* <Text>{test}</Text> */}
        {/* </Group> */}
        <Group name="Async functions">
          <Button
            disabled={!isYawlReady}
            title="Set value"
            onPress={async () => {
              yawl.track({
                name: "rn-test",
                establishment_account_id: "establishment_account_id",
                user_type: "user_type",
              });
            }}
          />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  view: {
    flex: 1,
    height: 200,
  },
};
