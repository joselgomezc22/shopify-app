import { useAppQuery, useAuthenticatedFetch } from "./index";
 
 /**
   * * Method to make Requests to a Shopify Curl Endpoint
   * @param {*} body 
   * @returns 
   */

const fetch = useAuthenticatedFetch();
export const api = async (body) => {
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