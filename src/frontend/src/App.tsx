import "@cloudscape-design/global-styles/index.css";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{ text: "Coinly", href: "#" }}
          items={[
            { type: "link", text: "Dashboard", href: "#" },
            { type: "link", text: "Preferences", href: "#" },
          ]}
        />
      }
      content={<Dashboard />}
    />
  );
}

export default App;
