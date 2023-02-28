import { Card, Page, Layout, TextContainer, Heading , List , Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function GottenPlan() {

  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get("charge_id");

  return (
    <Page>
      <Heading >
      Congrats, you got your plan {param}
      </Heading>

      <Button onClick={()=>{}}></Button>
      
    </Page>
  );
}
