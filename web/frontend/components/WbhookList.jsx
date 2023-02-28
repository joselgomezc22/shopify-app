import { useContext, useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  List,
  Button
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { Context } from "@shopify/app-bridge-react";
import { ContextData } from "../Routes";
import { useEffect } from "react";





export function WbhookList() {
  
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  
  const fetch = useAuthenticatedFetch();
  const {
    data,
    refetch: refetchWebhookList,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/shopify/Webhook/all",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const webhooks = data || [];
  const  { userInfo }  = useContext(ContextData);

  /*
  const request_body2 = {
    data: {"product":{"title":"Eric New Product","body_html":"<strong>Good snowboard!</strong>","vendor":"Burton","product_type":"Snowboard","tags":["Barnes & Noble","Big Air","John's Fav"]}},
    endpoint: '/admin/api/2022-10/products.json',
    method: 'POST' 
  }; 
    */

  
  const request_body = {
    data: null,
    endpoint: '/admin/api/2022-10/recurring_application_charges/25374195864.json',
    method: 'DELETE' 
  };

  
 
  /**
   * 
   * @param {*} body 
   * @returns response
   */
  const api = async (body) => {
    
    /**
     * @Request will always be POST TYPE
     */
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch("/api/shopify/proxy",requestOptions);
  
    if (response.ok) {
      const data = await response.json()
      return data;
    } else {
      console.log; ('none');
    }
  }

  const globalApi = async (body) => {
    
    const requestOptions = {
      method: body.method,
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await fetch(body.endpoint,requestOptions);
  
    if (response.ok) {
      const data = await response.json()
      return data;
    } else {
      console.log; ('none');
    }
  }

  const delWbhook = async (wbhookId) => {
    const body_req = {
      data: null,
      endpoint: `/admin/api/2022-10/webhooks/${wbhookId}.json`,
      method: 'DELETE' 
    };
    
    const data = await api(body_req.method , body_req.data , body_req.endpoint);
    if( data ) {
      refetchWebhookList();
    }
    
  }

  const deleteRecurringSubscription = async (charge_id) => { 
    
    const body_req = {
      data: null,
      endpoint: `/api/delete/billingRecurring`,
      method: 'POST' 
    };
    
    const data = await api(body_req);
    
  }

  const PlansList = async ()=> {
    const request = {
      data: null,
      endpoint: '/admin/api/2022-10/recurring_application_charges.json',
      method: 'GET' 
    };
    const data = await api(request);

    console.log(data);

  }

  PlansList();


 
  return (
    <>
      <Card
        title="WEBHOOKS LIST"
        sectioned
        
      >
        <TextContainer spacing="loose">
          
          
        </TextContainer> 
        <List type="bullet">
          {webhooks.map(webhook => (
            <List.Item >{webhook.address} | <Button onClick={()=> delWbhook(webhook.id)} destructive>Delete</Button></List.Item >
          ))}
        </List>
      </Card>
      <Card
        title="Access Info."  
      >
        <Heading element="h5">
            
            <DisplayText size="medium">
              Plan number : { JSON.stringify(userInfo.extra_info)}
            </DisplayText>
          </Heading>
          <Button onClick={()=>api(request_body)} > Delete Subscription </Button>

          <button id="gg"> click vanilla</button>
      </Card>
      <div> 
        <h2>
          Plans List
        </h2>
        <p>
            <ul>

            </ul>
        </p>
      </div>
      
    </>
  );
}
