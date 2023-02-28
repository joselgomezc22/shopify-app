import {
  Card,
  Page,
  Layout,
  TextContainer,
  Heading,
  Button,
  Frame,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useRef, useEffect } from "react";


export default function PageName() {
  const [state, setState] = useState([
    { id: 1, name: "shrek" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
    { id: 2, name: "fiona" },
  ]);

  return (
    <Page>
      <TitleBar
        title="Template Manager"
        primaryAction={()=>{alert('hi there')}}
        secondaryActions={[
          {
            content: "View Templates",
            onAction: () => console.log("Secondary action"),
          },
        ]}
      />
      <Layout>

        

      </Layout>
    </Page>
  );
}
