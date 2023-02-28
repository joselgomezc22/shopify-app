import { readFileSync } from "fs";


/**
 * Public app Config Helper
*/
class PublicConfig {
    JSON_CONFIG_FILE = readFileSync('./app.config.json');

    JSON_CONFIG =  JSON.parse(this.JSON_CONFIG_FILE);

    recurringChargesSetup = async (req,res) => {
        JSON_CONFIG.recurring_plans.map( async ( plan_item ) => {
          const session = await Shopify.Utils.loadCurrentSession(req,res,app.get("use-online-tokens"));
          const serverDomain = JSON_CONFIG.server_domain;
          
          const data = {
            "recurring_application_charge":
              {
                "name": plan_item.name,
                "price": plan_item.price,
                "return_url":`${serverDomain}${plan_item.return_url}`,
                "test": true
              }
          };
          const endpoint = '/admin/api/2022-10/recurring_application_charges.json';
      
          const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token' : session['accessToken'] },
              body: JSON.stringify(data)
          };
          const response = await fetch(`https://${session.shop}${endpoint}`,requestOptions);
          if (response.ok) {
            const data = await response.json();
            //res.status(response.status).send(data);
          } else {
            console.log; ('none'); 
          }
        });
      }
}

export default PublicConfig;

