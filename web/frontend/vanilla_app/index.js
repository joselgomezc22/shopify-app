const div = document.getElementById('div');

div.innerHTML = '<h2>Select a plan to unlock features😉</h2>'

const btn = document.getElementById('btn');
const tBody = document.getElementById('productListItems');

/**
 * @CustomEvent
 * Global Method to make request to on Parent
 * @return {Promise} : Method return;
 */
const app = {
    call: (data) => {
        const call = new Promise( (res, rej) => {
            
            data._call_nonce = (Math.random() + 1).toString(36).substring(7);
            var event = new CustomEvent('call', { detail: data })
            window.document.addEventListener('response', e => {
                if(e.detail._call_nonce != data._call_nonce) return;
                res(e.detail)
            }, false)
            window.parent.document.dispatchEvent(event)							
        })
        return call; 
    } 
}


/**
 * @product List with vanilla JavaScript
 */
const request_body = {
    data: {},
    endpoint: '/admin/api/2022-10/products.json',
    method: 'GET' 
};
/**
 * @api method as callback to use the Shopify proxy;
 */
app.call({test:true,callBack: 'api',argument: request_body}).then(response=>{
    console.log(response);
    const products = response.return.products;
    if (products){
        let count = 0;
        products.map(product => {
            count++;
            tBody.innerHTML += `
                <tr>
                <td>${count}</td>
                <td>${product.title}</td>
                <td>Wear</td>
                </tr>
                `;
        });
    }
})

/**
 * @Plans
 * Get the available plans
 */

const getJson = async () => {
    const request = {
        data: null,
        endpoint: '/api/json',
        method: 'GET'
    };
    return app.call( {callBack: 'globalApi', argument: request} ).then(response => { return response; })
};

/**
 * @Plans
 * Get the available plans
 */

const init = async (e) => {
    

    var json_config = getJson();
    const plans = json_config.recurring_plans;
    const defaultPlan = plans.filter(plan => { plan.default == true })[0];

    if (defaultPlan) {
         setRecurringPlan(defaultPlan);
    }

};
const hasActivePlan = async (e) => {
    const request = {
        endpoint: 'api/hasActivePlan',
        data: null,
        method: 'GET'
    };

    app.call( {callBack: 'globalApi', argument: request} ).then(response => { return response; })
}

/**
 * Method to subscribe to a recurring subscription plan
 * @param {object} plan 
 */
const setRecurringPlan = async (plan) => {
    app.call({callBack: 'createSubscription', argument: plan}).then(response=> {
            // The user will be redirected to the ReturnUrl;
        });

};

document.getElementById('getplans_').addEventListener('click', async (e) => {

    const data = await getJson();
    const plans = data.return.recurring_plans;

    const plansGrid = document.getElementById('plans_grid');

    if (plans.length > 0) {
    plans.map(plan => {
        console.log(plan);  
        plansGrid.innerHTML += `
                <div class="plans_grid__item">
                <div class="">
                    <div class="plans_grid__item-title">
                        <h3> ${plan.name} </h3>
                        <h3> ${plan.price} $ </h3>
                        <button class="GET_PLAN" data-planinfo="${JSON.stringify(plan)}"> Get it now</button>
                    </div>
                </div>
                </div>
        `;
    })
}
}); 



document.getElementById('plan_switch').addEventListener('click', async () =>{
    
    const test_plan = {"recurring_application_charge":{"name":"Gold Plan","price":5.0,"return_url":"https://mysizzle.myshopify.com/admin/apps/baseline-node-app/subscribed_plan","test":true}}


    app.call({callBack: 'switchSubscriptionPlan',argument: test_plan}).then(response=>{
        
    })
    
});