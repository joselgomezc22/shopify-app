import { useState , useRef ,useEffect } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Button
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

/**
 * * Base Component
 * @returns 
 */ 


export function ProductsCard() {
/*
  
*/
  /**
   * * Method to make Requests to a Shopify Curl Endpoint
   * @param {*} body 
   * @returns 
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

  /**
   * * Method to make Requests to a specific node Endpoint
   * @param {*} body  object 
   * @returns 
   */
  const globalApi = async (body) => {
    
    const requestOptions = {
      method: body.method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body.method == 'POST') requestOptions.body = JSON.stringify(body.data);

   

    const response = await fetch(body.endpoint,requestOptions); 
    if (response.ok) {
      const data = await response.json()
      return data;
    } else {
      console.log('none');
      return response;
    }
  }

  /**
   * 
   * @param {Object} plan_info { chargeName: "Plan Name",  amount: Plan.price }
   */
  const validateSubscription = async (plan_info)=> {

    const body = {
      method: 'GET',
      endpoint: '/api/ensureBilling',
      data: plan_info
    };
    const data = await globalApi(body);
    if (data){
      if(!data[0]) routeRedirect(data[1]);

    }
    console.log(data);
  }  


  const getJsonConfig = async () => {
    const json = await globalApi( { method:'GET' ,endpoint: '/api/json' ,data: null} )
    return json;
  }


  const test_plan = {"recurring_application_charge":{"name":"Gold Plan","price":5.0,"return_url":"https://mysizzle.myshopify.com/admin/apps/baseline-node-app/gotten_plan","test":true}}

  const createSubscription = async (plan_info)=> {

    const body = {
      method: 'POST',
      endpoint: '/admin/api/2022-10/recurring_application_charges.json',
      data: plan_info
    };
    
    const data = await api(body);
    if (data.recurring_application_charge){
      /**
       * * Store on database the data info here
       */
      console.log(data.recurring_application_charge);
       const storeOnDB = await storeDBPlanInfo(data.recurring_application_charge)
      console.log(storeOnDB)
       if(storeOnDB){
        routeRedirect(data.recurring_application_charge.confirmation_url);
       }

    }
    
  }

  /**
   * 
   * @returns {object} : {"id": id_number, "name": "plan_name", "price": "10.00", "extra_info": { }}
}
   */
  const getCurrentChargeInfo = async () => {
    const body = {
      method: 'GET',
      endpoint: '/api/plan/info'
    };
    const data = await globalApi(body);

    console.log(data);
    return data;
  };

  /**
   * 
   * @param {object} : {plan_info}
   */
  const switchSubscriptionPlan = async (obj) => {
    const plan_info = obj;
    const currentActive = await getCurrentChargeInfo();

    const cancelCurrent = await cancelSubscription(currentActive.id);

    if (cancelSubscription){
      alert('cancelSubscription');
      createSubscription(plan_info);
    }
  }

  /**
   * 
   * @param {number} id 
   */
  const cancelSubscription = async (id) => {
    const body = {
      endpoint: '/api/delete/billingRecurring',
      method: 'POST',
      data: {
        'id': id,
      }
    }
    const data = await globalApi(body);
    if(data) return true;
  };

  /**
   * @param {object} plan_info 
   * @return {boolean} true if successful
   */
  const storeDBPlanInfo = async (plan_info) => {
    const body = {
      method: 'POST',
      data: plan_info,
      endpoint: '/api/plan/setup'
    };
    const data = await globalApi(body);
    return data;

  }

  /**
   * 
   * @returns null if there is not an Stored on DB Subscription || object of subscription information
   */
  const validateDBPlanInfo = async ()=> {
    const body = {
      method: 'GET',
      data: null,
      endpoint: '/api/plan/info'
    };
    const data = await globalApi(body);
    if(data){
      console.log(data);
      return data;
    }
  }

  const routeRedirect = async (route) => {
    window.open(
      route,
      '_parent'
    );
  };


  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if(!flag){
     window.document.addEventListener('call', async (e) => {
      setFlag(true)
      console.log('event Listened')

      const iframeEl = iframeRef.current;


      const availableMethods = {
        api: api, 
        getCurrentChargeInfo: getCurrentChargeInfo, 
        cancelSubscription: cancelSubscription, 
        switchSubscriptionPlan: switchSubscriptionPlan, 
        createSubscription: createSubscription, 
        globalApi: globalApi 
      };

      const callBack = availableMethods[e.detail.callBack];
      const argument = e.detail.argument || null;

      const data = {};
        if (callBack) { 
            data.return = await callBack(argument);
        }else {
          data.return = {'response': 0};
          console.log('no callBack Registered');
        }
  
      

      data._call_nonce = e.detail._call_nonce;
      var event = new CustomEvent('response', { detail: data });
      iframeEl.contentDocument.dispatchEvent(event);

      e.stopImmediatePropagation(); 
    })  
    }
    
  },[flag]); 

  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();

  const iframeRef = useRef(); 

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/shopify/Product/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );
  
  return (
    <>
      {toastMarkup}
     

      <Button onClick={()=>{createSubscription(test_plan)}}>Subscribe to Silver Plan </Button>
      <Button onClick={()=>{switchSubscriptionPlan(test_plan)}}>Switch to Gold Plan </Button>

      <br />

    
      <iframe style={{border:'none',height:'10000000vh'}} ref={iframeRef} width="100%"  src="./vanilla_app/index.html" title="YouTube video player" ></iframe>
    </>
  );
}
