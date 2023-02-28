window.app = {

	storage: 'local',
	
	lists: {
		source:{},
		destination:{}
	},

	sites: {
		local: {

		}
	},

	shops: {
		source:false,
		destination:false
	},

	queue:{
		
		actions:[],
		
		add: t => {

			console.log(t);
			
			t.action = {
				method:'create',
				source: t.theme,
				destination:Number(app.themes.selected.destination.id),
				key:t.key,
				status:'pending'
			}
			
			if(app.themes.selected.destination.templates.map(i=>i.key).includes(t.key)) t.action.method = 'update'
			
			if(app.queue.actions.map(i=>i.key).includes(t.key) && confirm(`The Destination Queue already contains the ${t.key} template. Adding this will replace the item you already have in your queue.`)){
				app.queue.splice(app.queue.actions.map(i=>i.key).indexOf(t.key), 1);
			}
			app.queue.actions.push(t)

			app.templates.load('destination',t.key);
		},

		destination: (template_index, subdomain) => {
			console.log(template_index, subdomain)
		},
		
		process: ( manual = true) => {
			
			if(manual && !confirm('Are you sure you want to update the template?')) return false;

			const index = app.queue.actions.findIndex(a=>a.action.status=='pending');

			if(index===-1) {
				_n.qs(`.progress .bar`).style.opacity = '0'
				setTimeout(function(){
					// app.toast.message(`${app.queue.actions.length} Templates processed.`)		
					_n.qs(`.progress .bar`).style.width = '0%'
				},300);
				return;
			}

			const item = app.queue.actions[index].action;

			_n.qs(`.progress .bar`).style.opacity = '1'
			_n.qs(`.progress .bar`).style.width = '40%'

			app.queue.actions[index].action.status = 'uploading';

			app.shopify('destination',`themes/${item.destination}/assets`, 'PUT', ( u => {
				console.log('u',u)
				if(u.errors) {
					app.toast.message(`${item.key}<br/>${u.errors.asset[0]}`,'alert-triangle','red')
			        app.queue.actions[index].action.status = 'error';
				} else {
					app.toast.message(`${item.key} Updated`)
			        app.queue.actions[index].action.status = 'complete';
			        _n.qs(`.progress .bar`).style.width = '100%';
		        	app.queue.process(false);
		        }
		    }), {
		    	asset: {
		    		key:item.key,
		    		value: JSON.stringify({
            			sections:app.queue.actions[0].content.sections,
            			order:app.queue.actions[0].content.order
          			})
		    	}
		    });

			// app.shopify('destination',`themes/${item.source}/assets?asset[key]=${item.key}`, 'GET', (r=>{
			//     console.log('get',r) 
			//     _n.qs(`.progress .bar`).style.width = '70%';
			//     console.log(JSON.stringify(r))
			    	
			//     	}
			//     })
			// }))

		}
	},
	dragging:false,
	themes: {

		all:[],
		source:[],
		destination:[],

		selected: {
			source:{
				id:false,
				templates:[]
			},
			destination:{
				id:false,
				templates:[]
			},
		},

		init: () => {
			return Promise.all([
				app.themes.get('source'),
				app.themes.get('destination')
			])
		},

		get: port => {
			return app.shopify(port, 'themes', 'GET', d => {
				app.themes[port] = d.themes.map( t => { t.shop == app.shops[port]; return t; })
			}).then(()=>{ Neptune.liquid.load(port) });
		},

		select: (port, theme_id) => {
			app.themes.selected[port].id = theme_id;
			app.shopify(port, `themes/${app.themes.selected[port].id}/assets`, 'GET', r=>{

					if(!app.sites.local.public_asset_url_base)
						app.sites.local.public_asset_url_base = r.assets.find(a=>a.key.includes('assets/')).public_url.split('/t/')[0];

				    app.themes.selected[port].templates = r.assets

				    .filter(a => a.key.includes('templates/') && a.content_type=='application/json')
				    .map(t=>{
				    		// t.theme = app.themes.all.find(th=>th.id==app.themes.selected[port].id);
					    	t.shop = app.shops[port]
				    		return t;
				    });
				    	
				    Neptune.liquid.load(port);
				})

		}
	},

	templates: {

		load: (port, template, add=false) => {
			console.log(port, template);
			app.shopify(port, `themes/${app.themes.selected[port].id}/assets?asset[key]=${template}`, 'GET', r => {
				
				const content = JSON.parse(r.asset.value)
				
				app.themes.selected[port].templates.find(t=>t.key==template).content = app.templates.summarize(content);
				
				if(!!add){
 					app.queue.add(
 						app.themes.selected[port].templates.find(t=>t.key==template)
 					)
				} else {
					Neptune.liquid.load(port);
				}

			});
		},

		summarize: content => {

			content.summary = content.order.map( id => {
				
				const section = content.sections[id];
				
				const summary = {
					id:id,
					title:section.type,
					type:section.type,
			    images:[]			    	
				};

				['title','title_text'].forEach(field => {
			    if(!!section.settings[field]) summary.title = section.settings[field].replace(/(<([^>]+)>)/gi, "")
				})
			  if (summary.title==summary.type && !!section.blocks){
			    Object.values(section.blocks).forEach( block => {
			      ['title','title_text'].forEach(field => {
			        if(!!block.settings[field]) summary.title = block.settings[field].replace(/(<([^>]+)>)/gi, "")
			      })
			    })
			  }
				  
			  Object.values(section.settings).filter(value=>typeof value == 'string' && value.includes('shop_images')).forEach(img=>{
			    summary.images.push(`${app.sites.local.public_asset_url_base}/files/${img.split('shopify://shop_images/')[1].replace('.jpg','_small.jpg')}`)
			  })
				  
			  if(!!section.blocks){
			    Object.values(section.blocks).forEach( block => {
			      Object.values(block.settings).filter(value=>typeof value == 'string' && value.includes('shop_images')).forEach(img=>{
			        summary.images.push(`${app.sites.local.public_asset_url_base}/files/${img.split('shopify://shop_images/')[1].replace('.jpg','_small.jpg')}`)
			      })
			    })
			  }
		
				return summary;
			})

			return content;
		}
	},

	sections: {
		delete: (port, template, section_id) => {
			
			let content = app.themes.selected[port].templates.find(t=>t.key==template).content
			
			delete content.sections[section_id];
			content.order.splice(content.order.indexOf(section_id),1);
			
			content = app.templates.summarize(content)

			app.queue.actions[0].content = content
			
			Neptune.liquid.load(port);
		},
		edit: (port, template, section_id) => {
			const section = app.themes.selected[port].templates.find(t=>t.key==template).content.sections[section_id];
			const summary = app.themes.selected[port].templates.find(t=>t.key==template).content.summary.find(s=>s.id==section_id);
			_n.qs('[editor]').innerHTML = app.ui.highlight(JSON.stringify(section,null,2));
			_n.qs('[edit]').classList.add('flex')
			_n.qs('[edit-title]').textContent = summary.title
		}
	},

	shopify: (port, call, method = 'GET', callback, data) => {
		// console.log('data',data)
		const shop = app.config.multisite.find(s=>s.subdomain==app.shops[port])

		let config = {}
		if (method != 'GET') {
			config.method = method;
			config.mode='cors';
			if(!!data){
				// config.headers = {'Content-Type': 'application/json'};
				config.body = JSON.stringify(data)
			}
		}
		// console.log('config',config)
		return fetch(
			`/shopify/proxy/index.php?shop=${shop.subdomain}&token=${shop.token}&endpoint=${call.split('?')[0]}.json&${call.split('?')[1]}`,
			config).then(r=>r.json()).then(d=>{
		
			callback(d)
		
		});
	},
	
	init: () => {
		
		app.config = JSON.parse(window[`${app.storage}Storage`].getItem('config'))
		app.config.shop = window[`${app.storage}Storage`].getItem('shop')
		app.shops.source = app.shops.destination = app.config.subdomain = app.config.shop.split('.')[0];
		app.config.token = window[`${app.storage}Storage`].getItem('token')
		app.themes.init().then(t=>{
			Neptune.liquid.load('source')
			Neptune.liquid.load('destination')
		});

		document.addEventListener('template:rendered',e => {
			setTimeout(()=>{
				app.ui.init()
			},100)
		})

	},
	toast: {
	    queue: {},
	    timer: {},
	    message: ( message, icon, color, sound ) => {

	      if(!message) return false

	      const id = _n.random()
	      
	      app.toast.queue[id] = {
	        message:message,
	        icon:icon||'check',
	        color:color||'dark-gray'
	      }

	      Neptune.liquid.load('toast')
	      
	      if(!!sound){
	        _n.qs(`#${sound}`).play()
	      }

	      setTimeout(function(){
	        delete app.toast.queue[id]
	        Neptune.liquid.load('toast')
	      },5000)


	    }
	},
	ui: {
		init: () => {
			app.ui.drags();
		},
		drags: () => {
			_n.qsa('[neptune-sortable]').forEach(el => {
  				new Sortable(el,(
  					Object.assign(USON.parse(el.getAttribute('neptune-sortable'))[0],{
  						onEnd: e => {

								let from = app.themes.selected[e.from.dataset.port].templates.find(t=>t.key==e.from.dataset.key).content
  							// let to = app.themes.selected[e.to.dataset.port].templates.find(t=>t.key==e.to.dataset.key).content
  							
  							let to = app.queue.actions.find(a=>a.key==e.to.dataset.key).content

  							let id = e.item.dataset.section

  							if(to.order.includes(id)) {
  								to.order.splice(to.order.indexOf(id), 1)
  							} 

								to.sections[id] = from.sections[id]
								to.order.splice(e.newIndex, 0, id)
  							
  							to = app.templates.summarize(to)

								Neptune.liquid.load(e.to.dataset.port);

  						}
  					})
  				))
			})
		},
		drop: () => {
			console.log('drop')
		},
		highlight: json => {
		    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		        var cls = 'number';
		        if (/^"/.test(match)) {
		            if (/:$/.test(match)) {
		                cls = 'key';
		            } else {
		                cls = 'string';
		            }
		        } else if (/true|false/.test(match)) {
		            cls = 'boolean';
		        } else if (/null/.test(match)) {
		            cls = 'null';
		        }
		        return '<span class="' + cls + '">' + match + '</span>';
		    });
		},
		search: (column, query) => {
			console.log(column, query)
			Array.from(_n.qsa(`#${column} .template-item`)).forEach(item=>{
				console.log(item.textContent.toLowerCase())
				if (item.textContent.toLowerCase().includes(query.toLowerCase())){ item.classList.remove('dn') }
					else { item.classList.add('dn') }
			})
		}
	}
}

window.addEventListener('DOMContentLoaded', e => {

	app.init();

})

document.addEventListener('drop', e => {
	
	app.ui.drop();
	// console.log('dropped', app.themes.selected.source.templates[app.dragging])
	// app.queue.add(app.themes.selected.source.templates[app.dragging])

})