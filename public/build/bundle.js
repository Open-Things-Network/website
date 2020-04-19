
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Navbar.svelte generated by Svelte v3.20.1 */
    const file = "src/components/Navbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (34:8) {#if !(path===homePath || path===homePath+'index.html')}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "mr-auto svelte-1hu5s9b");
    			if (img.src !== (img_src_value = /*navlist*/ ctx[3].logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 34, 8, 861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlist*/ 8 && img.src !== (img_src_value = /*navlist*/ ctx[3].logo)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:8) {#if !(path===homePath || path===homePath+'index.html')}",
    		ctx
    	});

    	return block;
    }

    // (42:16) {#each navlist.elements as element}
    function create_each_block(ctx) {
    	let a;
    	let t_value = /*element*/ ctx[6].label[/*language*/ ctx[2]] + "";
    	let t;
    	let a_href_value;
    	let a_target_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "nav-item nav-link ml-auto mycolor svelte-1hu5s9b");

    			attr_dev(a, "href", a_href_value = /*element*/ ctx[6].url === "/"
    			? /*homePath*/ ctx[1]
    			: /*element*/ ctx[6].url);

    			attr_dev(a, "target", a_target_value = /*element*/ ctx[6].target);
    			add_location(a, file, 42, 16, 1391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlist, language*/ 12 && t_value !== (t_value = /*element*/ ctx[6].label[/*language*/ ctx[2]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*navlist, homePath*/ 10 && a_href_value !== (a_href_value = /*element*/ ctx[6].url === "/"
    			? /*homePath*/ ctx[1]
    			: /*element*/ ctx[6].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*navlist*/ 8 && a_target_value !== (a_target_value = /*element*/ ctx[6].target)) {
    				attr_dev(a, "target", a_target_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:16) {#each navlist.elements as element}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let div1;
    	let t0;
    	let button;
    	let span;
    	let t1;
    	let div0;
    	let ul;
    	let if_block = !(/*path*/ ctx[0] === /*homePath*/ ctx[1] || /*path*/ ctx[0] === /*homePath*/ ctx[1] + "index.html") && create_if_block(ctx);
    	let each_value = /*navlist*/ ctx[3].elements;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			span = element("span");
    			t1 = space();
    			div0 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 37, 12, 1148);
    			attr_dev(button, "class", "navbar-toggler ml-auto");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarNavAltMarkup");
    			attr_dev(button, "aria-controls", "navbarNavAltMarkup");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 36, 8, 937);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file, 40, 12, 1291);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarNavAltMarkup");
    			add_location(div0, file, 39, 8, 1216);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file, 32, 4, 764);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light bg-light svelte-1hu5s9b");
    			add_location(nav, file, 31, 0, 700);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!(/*path*/ ctx[0] === /*homePath*/ ctx[1] || /*path*/ ctx[0] === /*homePath*/ ctx[1] + "index.html")) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*navlist, homePath, language*/ 14) {
    				each_value = /*navlist*/ ctx[3].elements;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { path } = $$props;
    	let { homePath } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { cmsMode } = $$props;

    	let navlist = {
    		"title": "",
    		"logo": "",
    		"elements": [
    			{
    				url: "/",
    				label: { en: "Home", pl: "Home" },
    				target: ""
    			}
    		]
    	};

    	onMount(async () => {
    		if (cmsMode) {
    			const res = await cricketDocs.getJsonFile(`navigation.json`);
    			$$invalidate(3, navlist = await res);
    		} else {
    			const res = await cricketDocs.getJsonFile(`navigation.json`);
    			$$invalidate(3, navlist = await res);
    		}

    		document.title = navlist.title;
    	});

    	const writable_props = ["path", "homePath", "language", "defaultLanguage", "cmsMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	$$self.$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(4, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(5, cmsMode = $$props.cmsMode);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		path,
    		homePath,
    		language,
    		defaultLanguage,
    		cmsMode,
    		navlist
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(4, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(5, cmsMode = $$props.cmsMode);
    		if ("navlist" in $$props) $$invalidate(3, navlist = $$props.navlist);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, homePath, language, navlist, defaultLanguage, cmsMode];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			path: 0,
    			homePath: 1,
    			language: 2,
    			defaultLanguage: 4,
    			cmsMode: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<Navbar> was created without expected prop 'path'");
    		}

    		if (/*homePath*/ ctx[1] === undefined && !("homePath" in props)) {
    			console.warn("<Navbar> was created without expected prop 'homePath'");
    		}

    		if (/*language*/ ctx[2] === undefined && !("language" in props)) {
    			console.warn("<Navbar> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[4] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<Navbar> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*cmsMode*/ ctx[5] === undefined && !("cmsMode" in props)) {
    			console.warn("<Navbar> was created without expected prop 'cmsMode'");
    		}
    	}

    	get path() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get homePath() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set homePath(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cmsMode() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cmsMode(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.20.1 */
    const file_1 = "src/components/Footer.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "row");
    			add_location(div0, file_1, 27, 8, 629);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file_1, 26, 4, 597);
    			attr_dev(div2, "class", "jumbotron ft svelte-17l067w");
    			add_location(div2, file_1, 25, 0, 566);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			div0.innerHTML = /*content*/ ctx[0];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1) div0.innerHTML = /*content*/ ctx[0];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { file } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { cmsMode } = $$props;
    	let content = "";
    	let prefix;

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";
    		let res = "";

    		if (cmsMode) {
    			//TODO
    			res = await fetch(prefix + file);

    			$$invalidate(0, content = await res.text());
    		} else {
    			res = await fetch(prefix + file);
    			$$invalidate(0, content = await res.text());
    		}
    	});

    	const writable_props = ["file", "language", "defaultLanguage", "cmsMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);

    	$$self.$set = $$props => {
    		if ("file" in $$props) $$invalidate(1, file = $$props.file);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(4, cmsMode = $$props.cmsMode);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		file,
    		language,
    		defaultLanguage,
    		cmsMode,
    		content,
    		prefix
    	});

    	$$self.$inject_state = $$props => {
    		if ("file" in $$props) $$invalidate(1, file = $$props.file);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(4, cmsMode = $$props.cmsMode);
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, file, language, defaultLanguage, cmsMode];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			file: 1,
    			language: 2,
    			defaultLanguage: 3,
    			cmsMode: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*file*/ ctx[1] === undefined && !("file" in props)) {
    			console.warn("<Footer> was created without expected prop 'file'");
    		}

    		if (/*language*/ ctx[2] === undefined && !("language" in props)) {
    			console.warn("<Footer> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[3] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<Footer> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*cmsMode*/ ctx[4] === undefined && !("cmsMode" in props)) {
    			console.warn("<Footer> was created without expected prop 'cmsMode'");
    		}
    	}

    	get file() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cmsMode() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cmsMode(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Jumbotron.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/components/Jumbotron.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = "resources/new_logo_horizontal_v3.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "logo_img svelte-14uvmc6");
    			add_location(img, file$1, 7, 8, 303);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$1, 6, 4, 259);
    			attr_dev(div1, "class", "jumbotron");
    			set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.5) 100%), url(" + /*bgImgLocation*/ ctx[0] + ")");
    			add_location(div1, file$1, 5, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { homePath } = $$props;
    	let bgImgLocation = homePath + "resources/jumbotron.png";
    	const writable_props = ["homePath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Jumbotron> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Jumbotron", $$slots, []);

    	$$self.$set = $$props => {
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    	};

    	$$self.$capture_state = () => ({ homePath, bgImgLocation });

    	$$self.$inject_state = $$props => {
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    		if ("bgImgLocation" in $$props) $$invalidate(0, bgImgLocation = $$props.bgImgLocation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgImgLocation, homePath];
    }

    class Jumbotron extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { homePath: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jumbotron",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*homePath*/ ctx[1] === undefined && !("homePath" in props)) {
    			console.warn("<Jumbotron> was created without expected prop 'homePath'");
    		}
    	}

    	get homePath() {
    		throw new Error("<Jumbotron>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set homePath(value) {
    		throw new Error("<Jumbotron>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Section.svelte generated by Svelte v3.20.1 */
    const file_1$1 = "src/components/Section.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let center;
    	let h2;
    	let img;
    	let img_src_value;
    	let br;
    	let t0;
    	let t1;
    	let hr;
    	let t2;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			center = element("center");
    			h2 = element("h2");
    			img = element("img");
    			br = element("br");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div1 = element("div");
    			if (img.src !== (img_src_value = /*icon*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50px;");
    			attr_dev(img, "alt", /*title*/ ctx[0]);
    			set_style(img, "margin-bottom", "1rem");
    			add_location(img, file_1$1, 21, 20, 608);
    			add_location(br, file_1$1, 21, 96, 684);
    			add_location(h2, file_1$1, 21, 16, 604);
    			add_location(center, file_1$1, 21, 8, 596);
    			attr_dev(hr, "class", "svelte-k6tlcu");
    			add_location(hr, file_1$1, 22, 8, 719);
    			attr_dev(div0, "class", "container section");
    			add_location(div0, file_1$1, 20, 4, 556);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file_1$1, 24, 4, 739);
    			set_style(div2, "background", /*bgcolor*/ ctx[3]);
    			set_style(div2, "padding-top", "2rem");
    			set_style(div2, "padding-bottom", "2rem");
    			add_location(div2, file_1$1, 19, 0, 474);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, center);
    			append_dev(center, h2);
    			append_dev(h2, img);
    			append_dev(h2, br);
    			append_dev(h2, t0);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			div1.innerHTML = /*content*/ ctx[2];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*icon*/ 2 && img.src !== (img_src_value = /*icon*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*title*/ 1) {
    				attr_dev(img, "alt", /*title*/ ctx[0]);
    			}

    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*content*/ 4) div1.innerHTML = /*content*/ ctx[2];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	let { icon } = $$props;
    	let { file } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { idx } = $$props;
    	let content;
    	let prefix;
    	let bgcolor = idx % 2 == 0 ? "white" : "#f8f8f8";

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";
    		const res = await fetch(prefix + file);
    		$$invalidate(2, content = await res.text());
    	});

    	const writable_props = ["title", "icon", "file", "language", "defaultLanguage", "idx"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Section", $$slots, []);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("file" in $$props) $$invalidate(4, file = $$props.file);
    		if ("language" in $$props) $$invalidate(5, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(6, defaultLanguage = $$props.defaultLanguage);
    		if ("idx" in $$props) $$invalidate(7, idx = $$props.idx);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		title,
    		icon,
    		file,
    		language,
    		defaultLanguage,
    		idx,
    		content,
    		prefix,
    		bgcolor
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("file" in $$props) $$invalidate(4, file = $$props.file);
    		if ("language" in $$props) $$invalidate(5, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(6, defaultLanguage = $$props.defaultLanguage);
    		if ("idx" in $$props) $$invalidate(7, idx = $$props.idx);
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    		if ("bgcolor" in $$props) $$invalidate(3, bgcolor = $$props.bgcolor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, icon, content, bgcolor, file, language, defaultLanguage, idx];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			title: 0,
    			icon: 1,
    			file: 4,
    			language: 5,
    			defaultLanguage: 6,
    			idx: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Section> was created without expected prop 'title'");
    		}

    		if (/*icon*/ ctx[1] === undefined && !("icon" in props)) {
    			console.warn("<Section> was created without expected prop 'icon'");
    		}

    		if (/*file*/ ctx[4] === undefined && !("file" in props)) {
    			console.warn("<Section> was created without expected prop 'file'");
    		}

    		if (/*language*/ ctx[5] === undefined && !("language" in props)) {
    			console.warn("<Section> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[6] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<Section> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*idx*/ ctx[7] === undefined && !("idx" in props)) {
    			console.warn("<Section> was created without expected prop 'idx'");
    		}
    	}

    	get title() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get file() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get idx() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idx(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/News.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/News.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (76:16) {#if homePath==='/'}
    function create_if_block$1(ctx) {
    	let hr;
    	let t0;
    	let div3;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2_value = /*config*/ ctx[3].link[/*language*/ ctx[1]] + "";
    	let t2;
    	let a0_href_value;
    	let a0_onclick_value;
    	let t3;
    	let div1;
    	let t4_value = /*config*/ ctx[3].comments[/*language*/ ctx[1]] + "";
    	let t4;
    	let t5;
    	let t6_value = /*getCommentsSize*/ ctx[8](/*article*/ ctx[13].uid) + "";
    	let t6;
    	let t7;
    	let div2;
    	let a1;
    	let t8_value = /*config*/ ctx[3].send[/*language*/ ctx[1]] + "";
    	let t8;
    	let a1_href_value;
    	let t9;
    	let show_if = /*getCommentsSize*/ ctx[8](/*article*/ ctx[13].uid) > 0;
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			t4 = text(t4_value);
    			t5 = text(": ");
    			t6 = text(t6_value);
    			t7 = space();
    			div2 = element("div");
    			a1 = element("a");
    			t8 = text(t8_value);
    			t9 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(hr, "class", "comments svelte-f9z9h7");
    			add_location(hr, file$2, 76, 16, 2639);
    			if (img.src !== (img_src_value = "resources/link.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 83, 25, 3028);
    			attr_dev(a0, "class", "permalink svelte-f9z9h7");
    			attr_dev(a0, "href", a0_href_value = "#" + /*article*/ ctx[13].uid);
    			attr_dev(a0, "onclick", a0_onclick_value = "prompt('" + /*config*/ ctx[3].prompt[/*language*/ ctx[1]] + "','" + /*config*/ ctx[3].siteUrl + /*homePath*/ ctx[2] + /*folder*/ ctx[0] + ".html#" + /*article*/ ctx[13].uid + "'); return false;");
    			add_location(a0, file$2, 79, 24, 2768);
    			attr_dev(div0, "class", "col-4");
    			add_location(div0, file$2, 78, 20, 2724);
    			attr_dev(div1, "class", "col-4");
    			add_location(div1, file$2, 85, 20, 3135);
    			attr_dev(a1, "class", "btn btn-sm btn-outline-secondary");
    			attr_dev(a1, "role", "button");
    			attr_dev(a1, "href", a1_href_value = "mailto:" + /*config*/ ctx[3].email + "?subject=ID:" + /*article*/ ctx[13].uid + "&body=" + /*commentDisclaimer*/ ctx[6]);
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$2, 87, 24, 3295);
    			attr_dev(div2, "class", "col-4 text-right");
    			add_location(div2, file$2, 86, 20, 3240);
    			attr_dev(div3, "class", "row comments svelte-f9z9h7");
    			add_location(div3, file$2, 77, 16, 2677);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(a0, t1);
    			append_dev(a0, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, a1);
    			append_dev(a1, t8);
    			insert_dev(target, t9, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config, language*/ 10 && t2_value !== (t2_value = /*config*/ ctx[3].link[/*language*/ ctx[1]] + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*index*/ 16 && a0_href_value !== (a0_href_value = "#" + /*article*/ ctx[13].uid)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*config, language, homePath, folder, index*/ 31 && a0_onclick_value !== (a0_onclick_value = "prompt('" + /*config*/ ctx[3].prompt[/*language*/ ctx[1]] + "','" + /*config*/ ctx[3].siteUrl + /*homePath*/ ctx[2] + /*folder*/ ctx[0] + ".html#" + /*article*/ ctx[13].uid + "'); return false;")) {
    				attr_dev(a0, "onclick", a0_onclick_value);
    			}

    			if (dirty & /*config, language*/ 10 && t4_value !== (t4_value = /*config*/ ctx[3].comments[/*language*/ ctx[1]] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*index*/ 16 && t6_value !== (t6_value = /*getCommentsSize*/ ctx[8](/*article*/ ctx[13].uid) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*config, language*/ 10 && t8_value !== (t8_value = /*config*/ ctx[3].send[/*language*/ ctx[1]] + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*config, index, commentDisclaimer*/ 88 && a1_href_value !== (a1_href_value = "mailto:" + /*config*/ ctx[3].email + "?subject=ID:" + /*article*/ ctx[13].uid + "&body=" + /*commentDisclaimer*/ ctx[6])) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*index*/ 16) show_if = /*getCommentsSize*/ ctx[8](/*article*/ ctx[13].uid) > 0;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t9);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(76:16) {#if homePath==='/'}",
    		ctx
    	});

    	return block;
    }

    // (93:16) {#if getCommentsSize(article.uid)>0}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*comments*/ ctx[7][/*article*/ ctx[13].uid];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*comments, index*/ 144) {
    				each_value_1 = /*comments*/ ctx[7][/*article*/ ctx[13].uid];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(93:16) {#if getCommentsSize(article.uid)>0}",
    		ctx
    	});

    	return block;
    }

    // (94:16) {#each comments[article.uid] as comment}
    function create_each_block_1(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*comment*/ ctx[16].date + "";
    	let t0;
    	let t1;
    	let i;
    	let t2_value = /*comment*/ ctx[16].email + "";
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let t4_value = /*comment*/ ctx[16].text + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			i = element("i");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			add_location(i, file$2, 95, 55, 3796);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file$2, 95, 20, 3761);
    			attr_dev(div1, "class", "row comment-header svelte-f9z9h7");
    			add_location(div1, file$2, 94, 16, 3708);
    			attr_dev(div2, "class", "col-12");
    			add_location(div2, file$2, 98, 20, 3910);
    			attr_dev(div3, "class", "row comment svelte-f9z9h7");
    			add_location(div3, file$2, 97, 16, 3864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, i);
    			append_dev(i, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(div3, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*index*/ 16 && t0_value !== (t0_value = /*comment*/ ctx[16].date + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*index*/ 16 && t2_value !== (t2_value = /*comment*/ ctx[16].email + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*index*/ 16 && t4_value !== (t4_value = /*comment*/ ctx[16].text + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(94:16) {#each comments[article.uid] as comment}",
    		ctx
    	});

    	return block;
    }

    // (72:12) {#each index as article}
    function create_each_block$1(ctx) {
    	let div;
    	let a;
    	let a_id_value;
    	let t0;
    	let html_tag;
    	let raw_value = /*article*/ ctx[13].content + "";
    	let t1;
    	let t2;
    	let if_block = /*homePath*/ ctx[2] === "/" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = space();
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(a, "id", a_id_value = /*article*/ ctx[13].uid);
    			add_location(a, file$2, 73, 16, 2519);
    			html_tag = new HtmlTag(raw_value, t1);
    			attr_dev(div, "class", "container");
    			add_location(div, file$2, 72, 12, 2479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(div, t0);
    			html_tag.m(div);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*index*/ 16 && a_id_value !== (a_id_value = /*article*/ ctx[13].uid)) {
    				attr_dev(a, "id", a_id_value);
    			}

    			if (dirty & /*index*/ 16 && raw_value !== (raw_value = /*article*/ ctx[13].content + "")) html_tag.p(raw_value);

    			if (/*homePath*/ ctx[2] === "/") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(72:12) {#each index as article}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t0_value = /*config*/ ctx[3].title.pl + "";
    	let t0;
    	let t1;
    	let div5;
    	let div4;
    	let div2;
    	let img;
    	let img_src_value;
    	let t2;
    	let div3;
    	let each_value = /*index*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t2 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "title svelte-f9z9h7");
    			add_location(h1, file$2, 62, 8, 2173);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$2, 61, 4, 2129);
    			set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[5] + ")");
    			add_location(div1, file$2, 59, 0, 1987);
    			if (img.src !== (img_src_value = /*folder*/ ctx[0] + "/icon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "subpage_img svelte-f9z9h7");
    			add_location(img, file$2, 68, 12, 2333);
    			attr_dev(div2, "class", "col-md-3 text-center");
    			add_location(div2, file$2, 67, 8, 2286);
    			attr_dev(div3, "class", "col-md-9");
    			add_location(div3, file$2, 70, 8, 2407);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$2, 66, 4, 2260);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$2, 65, 0, 2232);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, img);
    			append_dev(div4, t2);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*config*/ 8 && t0_value !== (t0_value = /*config*/ ctx[3].title.pl + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*bgImgLocation*/ 32) {
    				set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[5] + ")");
    			}

    			if (dirty & /*folder*/ 1 && img.src !== (img_src_value = /*folder*/ ctx[0] + "/icon.png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*comments, index, getCommentsSize, config, commentDisclaimer, language, homePath, folder*/ 479) {
    				each_value = /*index*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { folder } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { cmsMode } = $$props; // for next version - not used now     
    	let { homePath } = $$props;
    	let prefix;
    	let config = { "title": { "pl": "", "en": "" } };
    	let index = [];
    	let bgImgLocation;
    	let commentDisclaimer = "";

    	//let comments = {"2020-03-20": [{email: "x@y", date: "2020-03-21", text: "mój komentarz"}, {email: "aa@bb.cc", date: "2020-03-22", text: "mój 2 komentarz"}]};
    	let comments = {};

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";

    		if (cmsMode) {
    			$$invalidate(5, bgImgLocation = homePath + "resources/jumbotron.png");
    		} else {
    			$$invalidate(5, bgImgLocation = homePath + "resources/jumbotron.png");
    		}

    		// get news config
    		const tres = await cricketDocs.getJsonFile(prefix + folder + "/config.json");

    		$$invalidate(3, config = await tres);
    		$$invalidate(6, commentDisclaimer = "%0D%0A%0D%0A" + encodeURI(config.disclaimer[language]));

    		// get articles
    		const res = await cricketDocs.getJsonFile(prefix + folder + "/index.json");

    		$$invalidate(4, index = await res);

    		for (var i = 0; i < index.length; i++) {
    			const c = await cricketDocs.getTextFile(prefix + folder + "/" + index[i].name);
    			$$invalidate(4, index[i].uid = index[i].name.substring(0, index[i].name.lastIndexOf(".")), index);
    			$$invalidate(4, index[i].content = await c, index);
    		}

    		$$invalidate(4, index);
    	});

    	function getCommentsSize(id) {
    		const cList = comments[id];

    		if (typeof cList !== "undefined" && typeof cList !== null) {
    			return cList.length;
    		} else {
    			return 0;
    		}
    	}

    	function getComments(id) {
    		console.log("getComments " + id);
    		const cList = comments[id];

    		if (typeof cList !== "undefined" && typeof cList !== null) {
    			return cList;
    		} else {
    			return [];
    		}
    	}

    	const writable_props = ["folder", "language", "defaultLanguage", "cmsMode", "homePath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("News", $$slots, []);

    	$$self.$set = $$props => {
    		if ("folder" in $$props) $$invalidate(0, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(9, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(10, cmsMode = $$props.cmsMode);
    		if ("homePath" in $$props) $$invalidate(2, homePath = $$props.homePath);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		folder,
    		language,
    		defaultLanguage,
    		cmsMode,
    		homePath,
    		prefix,
    		config,
    		index,
    		bgImgLocation,
    		commentDisclaimer,
    		comments,
    		getCommentsSize,
    		getComments
    	});

    	$$self.$inject_state = $$props => {
    		if ("folder" in $$props) $$invalidate(0, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(9, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(10, cmsMode = $$props.cmsMode);
    		if ("homePath" in $$props) $$invalidate(2, homePath = $$props.homePath);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("bgImgLocation" in $$props) $$invalidate(5, bgImgLocation = $$props.bgImgLocation);
    		if ("commentDisclaimer" in $$props) $$invalidate(6, commentDisclaimer = $$props.commentDisclaimer);
    		if ("comments" in $$props) $$invalidate(7, comments = $$props.comments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		folder,
    		language,
    		homePath,
    		config,
    		index,
    		bgImgLocation,
    		commentDisclaimer,
    		comments,
    		getCommentsSize,
    		defaultLanguage,
    		cmsMode
    	];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			folder: 0,
    			language: 1,
    			defaultLanguage: 9,
    			cmsMode: 10,
    			homePath: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*folder*/ ctx[0] === undefined && !("folder" in props)) {
    			console_1.warn("<News> was created without expected prop 'folder'");
    		}

    		if (/*language*/ ctx[1] === undefined && !("language" in props)) {
    			console_1.warn("<News> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[9] === undefined && !("defaultLanguage" in props)) {
    			console_1.warn("<News> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*cmsMode*/ ctx[10] === undefined && !("cmsMode" in props)) {
    			console_1.warn("<News> was created without expected prop 'cmsMode'");
    		}

    		if (/*homePath*/ ctx[2] === undefined && !("homePath" in props)) {
    			console_1.warn("<News> was created without expected prop 'homePath'");
    		}
    	}

    	get folder() {
    		throw new Error("<News>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set folder(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<News>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<News>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cmsMode() {
    		throw new Error("<News>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cmsMode(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get homePath() {
    		throw new Error("<News>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set homePath(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Subpage.svelte generated by Svelte v3.20.1 */
    const file$3 = "src/components/Subpage.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div5;
    	let div4;
    	let div2;
    	let img;
    	let img_src_value;
    	let t2;
    	let div3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t2 = space();
    			div3 = element("div");
    			attr_dev(h1, "class", "title svelte-o10zcn");
    			add_location(h1, file$3, 38, 8, 1305);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$3, 37, 4, 1261);
    			set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[3] + ")");
    			add_location(div1, file$3, 35, 0, 1119);
    			if (img.src !== (img_src_value = "subpages/" + /*name*/ ctx[0] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "subpage_img svelte-o10zcn");
    			add_location(img, file$3, 44, 12, 1455);
    			attr_dev(div2, "class", "col-md-3 text-center");
    			add_location(div2, file$3, 43, 8, 1408);
    			attr_dev(div3, "class", "col-md-9");
    			add_location(div3, file$3, 46, 8, 1534);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$3, 42, 4, 1382);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$3, 41, 0, 1354);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, img);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			div3.innerHTML = /*content*/ ctx[2];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*bgImgLocation*/ 8) {
    				set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[3] + ")");
    			}

    			if (dirty & /*name*/ 1 && img.src !== (img_src_value = "subpages/" + /*name*/ ctx[0] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*content*/ 4) div3.innerHTML = /*content*/ ctx[2];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { cmsMode } = $$props;
    	let { homePath } = $$props;
    	let title = "title";
    	let content = "";
    	let prefix;
    	let bgImgLocation;

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";

    		if (cmsMode) {
    			$$invalidate(3, bgImgLocation = homePath + "resources/jumbotron.png");
    			const doc = await cricketDocs.getJsonFile(prefix + "subpages/" + name + ".html");
    			$$invalidate(1, title = doc.title);
    			$$invalidate(2, content = doc.content);
    		} else {
    			$$invalidate(3, bgImgLocation = homePath + "resources/jumbotron.png");
    			const res = await cricketDocs.getTextFile(prefix + "subpages/" + name + ".html");
    			$$invalidate(2, content = await res);
    			var parser = new DOMParser();
    			var doc = parser.parseFromString(content, "text/html");

    			try {
    				$$invalidate(1, title = doc.querySelector("article header title").innerHTML);
    			} catch(ex) {
    				$$invalidate(1, title = name);
    			}
    		}
    	});

    	const writable_props = ["name", "language", "defaultLanguage", "cmsMode", "homePath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Subpage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Subpage", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(6, cmsMode = $$props.cmsMode);
    		if ("homePath" in $$props) $$invalidate(7, homePath = $$props.homePath);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		name,
    		language,
    		defaultLanguage,
    		cmsMode,
    		homePath,
    		title,
    		content,
    		prefix,
    		bgImgLocation
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("cmsMode" in $$props) $$invalidate(6, cmsMode = $$props.cmsMode);
    		if ("homePath" in $$props) $$invalidate(7, homePath = $$props.homePath);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    		if ("bgImgLocation" in $$props) $$invalidate(3, bgImgLocation = $$props.bgImgLocation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		title,
    		content,
    		bgImgLocation,
    		language,
    		defaultLanguage,
    		cmsMode,
    		homePath
    	];
    }

    class Subpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			name: 0,
    			language: 4,
    			defaultLanguage: 5,
    			cmsMode: 6,
    			homePath: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subpage",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Subpage> was created without expected prop 'name'");
    		}

    		if (/*language*/ ctx[4] === undefined && !("language" in props)) {
    			console.warn("<Subpage> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[5] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<Subpage> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*cmsMode*/ ctx[6] === undefined && !("cmsMode" in props)) {
    			console.warn("<Subpage> was created without expected prop 'cmsMode'");
    		}

    		if (/*homePath*/ ctx[7] === undefined && !("homePath" in props)) {
    			console.warn("<Subpage> was created without expected prop 'homePath'");
    		}
    	}

    	get name() {
    		throw new Error("<Subpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Subpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<Subpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cmsMode() {
    		throw new Error("<Subpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cmsMode(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get homePath() {
    		throw new Error("<Subpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set homePath(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */
    const file$4 = "src/App.svelte";

    // (83:34) 
    function create_if_block_2(ctx) {
    	let current;

    	const subpage = new Subpage({
    			props: {
    				homePath: /*homePath*/ ctx[5],
    				name: /*folderName*/ ctx[7],
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1],
    				cmsMode: /*cmsMode*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(subpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subpage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const subpage_changes = {};
    			if (dirty & /*homePath*/ 32) subpage_changes.homePath = /*homePath*/ ctx[5];
    			if (dirty & /*folderName*/ 128) subpage_changes.name = /*folderName*/ ctx[7];
    			if (dirty & /*language*/ 1) subpage_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) subpage_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			if (dirty & /*cmsMode*/ 4) subpage_changes.cmsMode = /*cmsMode*/ ctx[2];
    			subpage.$set(subpage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(subpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(83:34) ",
    		ctx
    	});

    	return block;
    }

    // (81:33) 
    function create_if_block_1$1(ctx) {
    	let current;

    	const news = new News({
    			props: {
    				homePath: /*homePath*/ ctx[5],
    				folder: /*folderName*/ ctx[7],
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1],
    				cmsMode: /*cmsMode*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(news.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(news, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const news_changes = {};
    			if (dirty & /*homePath*/ 32) news_changes.homePath = /*homePath*/ ctx[5];
    			if (dirty & /*folderName*/ 128) news_changes.folder = /*folderName*/ ctx[7];
    			if (dirty & /*language*/ 1) news_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) news_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			if (dirty & /*cmsMode*/ 4) news_changes.cmsMode = /*cmsMode*/ ctx[2];
    			news.$set(news_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(news.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(news.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(news, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(81:33) ",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if 'home'===pageType}
    function create_if_block$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;

    	const jumbotron = new Jumbotron({
    			props: { homePath: /*homePath*/ ctx[5] },
    			$$inline: true
    		});

    	const section0 = new Section({
    			props: {
    				idx: "0",
    				title: "O nas",
    				icon: "sections/about.png",
    				file: "sections/about.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const section1 = new Section({
    			props: {
    				idx: "1",
    				title: "Manifest",
    				icon: "sections/manifest.png",
    				file: "sections/manifest.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const section2 = new Section({
    			props: {
    				idx: "2",
    				title: "Cele",
    				icon: "sections/goals.png",
    				file: "sections/goals.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const section3 = new Section({
    			props: {
    				idx: "3",
    				title: "Zadania",
    				icon: "sections/tasks.png",
    				file: "sections/tasks.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const section4 = new Section({
    			props: {
    				idx: "4",
    				title: "Udział w projektach",
    				icon: "sections/projects.png",
    				file: "sections/projects.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const section5 = new Section({
    			props: {
    				idx: "5",
    				title: "Dołącz do nas",
    				icon: "sections/join.png",
    				file: "sections/join.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const section6 = new Section({
    			props: {
    				idx: "6",
    				title: "Partnerzy",
    				icon: "sections/partners.png",
    				file: "sections/partners.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(jumbotron.$$.fragment);
    			t0 = space();
    			create_component(section0.$$.fragment);
    			t1 = space();
    			create_component(section1.$$.fragment);
    			t2 = space();
    			create_component(section2.$$.fragment);
    			t3 = space();
    			create_component(section3.$$.fragment);
    			t4 = space();
    			create_component(section4.$$.fragment);
    			t5 = space();
    			create_component(section5.$$.fragment);
    			t6 = space();
    			create_component(section6.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jumbotron, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(section0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(section3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(section4, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(section5, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(section6, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const jumbotron_changes = {};
    			if (dirty & /*homePath*/ 32) jumbotron_changes.homePath = /*homePath*/ ctx[5];
    			jumbotron.$set(jumbotron_changes);
    			const section0_changes = {};
    			if (dirty & /*language*/ 1) section0_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) section0_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			section0.$set(section0_changes);
    			const section1_changes = {};
    			if (dirty & /*language*/ 1) section1_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) section1_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			section1.$set(section1_changes);
    			const section2_changes = {};
    			if (dirty & /*language*/ 1) section2_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) section2_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			section2.$set(section2_changes);
    			const section3_changes = {};
    			if (dirty & /*language*/ 1) section3_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) section3_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			section3.$set(section3_changes);
    			const section4_changes = {};
    			if (dirty & /*language*/ 1) section4_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) section4_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			section4.$set(section4_changes);
    			const section5_changes = {};
    			if (dirty & /*language*/ 1) section5_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) section5_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			section5.$set(section5_changes);
    			const section6_changes = {};
    			if (dirty & /*language*/ 1) section6_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) section6_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			section6.$set(section6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jumbotron.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			transition_in(section3.$$.fragment, local);
    			transition_in(section4.$$.fragment, local);
    			transition_in(section5.$$.fragment, local);
    			transition_in(section6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jumbotron.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			transition_out(section3.$$.fragment, local);
    			transition_out(section4.$$.fragment, local);
    			transition_out(section5.$$.fragment, local);
    			transition_out(section6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jumbotron, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(section3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(section4, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(section5, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(section6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(72:4) {#if 'home'===pageType}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let t0;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let current;

    	let navbar_1_props = {
    		path: /*path*/ ctx[4],
    		homePath: /*homePath*/ ctx[5],
    		language: /*language*/ ctx[0],
    		defaultLanguage: /*defaultLanguage*/ ctx[1],
    		cmsMode: /*cmsMode*/ ctx[2]
    	};

    	const navbar_1 = new Navbar({ props: navbar_1_props, $$inline: true });
    	/*navbar_1_binding*/ ctx[14](navbar_1);
    	const if_block_creators = [create_if_block$2, create_if_block_1$1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if ("home" === /*pageType*/ ctx[6]) return 0;
    		if ("multi" === /*pageType*/ ctx[6]) return 1;
    		if ("single" === /*pageType*/ ctx[6]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const footer_1 = new Footer({
    			props: {
    				file: "sections/footer.html",
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1],
    				cmsMode: /*cmsMode*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar_1.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(footer_1.$$.fragment);
    			add_location(main, file$4, 69, 0, 2092);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar_1, main, null);
    			append_dev(main, t0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			append_dev(main, t1);
    			mount_component(footer_1, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_1_changes = {};
    			if (dirty & /*path*/ 16) navbar_1_changes.path = /*path*/ ctx[4];
    			if (dirty & /*homePath*/ 32) navbar_1_changes.homePath = /*homePath*/ ctx[5];
    			if (dirty & /*language*/ 1) navbar_1_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) navbar_1_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			if (dirty & /*cmsMode*/ 4) navbar_1_changes.cmsMode = /*cmsMode*/ ctx[2];
    			navbar_1.$set(navbar_1_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, t1);
    				} else {
    					if_block = null;
    				}
    			}

    			const footer_1_changes = {};
    			if (dirty & /*language*/ 1) footer_1_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) footer_1_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
    			if (dirty & /*cmsMode*/ 4) footer_1_changes.cmsMode = /*cmsMode*/ ctx[2];
    			footer_1.$set(footer_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar_1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar_1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*navbar_1_binding*/ ctx[14](null);
    			destroy_component(navbar_1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			destroy_component(footer_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getFolderName(pathName) {
    	if (pathName === "" || pathName === "/" || pathName.endsWith("index.html")) {
    		return "";
    	}

    	if (pathName.endsWith(".html")) {
    		return pathName.substring(pathName.lastIndexOf("/") + 1, pathName.lastIndexOf(".html"));
    	}
    }

    function getRoot(pathName) {
    	let pos;

    	if (pathName.startsWith("/")) {
    		pos = pathName.indexOf("/", 1);
    	} else {
    		pos = pathName.indexOf("/", 0);
    	}

    	if (pos > -1) {
    		return pathName.substring(0, pos + 1);
    	}

    	return "/";
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { devModePort } = $$props;
    	let { devMode = false } = $$props;
    	let { cmsMode } = $$props;

    	// child components which must be binded
    	let navbar;

    	let footer;
    	let pageArticle = { title: "", summary: "", content: "" };
    	let subpages = {};
    	let path;
    	let homePath;
    	let pageType;
    	let folderName;
    	let prefix;

    	onMount(async () => {
    		$$invalidate(4, path = window.location.pathname);
    		$$invalidate(8, devMode = window.origin.endsWith(":" + devModePort));

    		if (!devMode && window.location.hostname !== "localhost" && window.location.protocol !== "https:") {
    			window.location.protocol = "https:";
    		}

    		$$invalidate(6, pageType = window.localStorage.getItem("pageType"));
    		$$invalidate(7, folderName = getFolderName(window.location.pathname));
    		$$invalidate(5, homePath = getRoot(path));

    		//navbar.setHomePath(homePath);
    		prefix = language === defaultLanguage ? "" : language + "_";

    		cricketDocs.setCmsMode(cmsMode);
    	});

    	const writable_props = ["language", "defaultLanguage", "devModePort", "devMode", "cmsMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function navbar_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, navbar = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(1, defaultLanguage = $$props.defaultLanguage);
    		if ("devModePort" in $$props) $$invalidate(9, devModePort = $$props.devModePort);
    		if ("devMode" in $$props) $$invalidate(8, devMode = $$props.devMode);
    		if ("cmsMode" in $$props) $$invalidate(2, cmsMode = $$props.cmsMode);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Navbar,
    		Footer,
    		Jumbotron,
    		Section,
    		News,
    		Subpage,
    		language,
    		defaultLanguage,
    		devModePort,
    		devMode,
    		cmsMode,
    		navbar,
    		footer,
    		pageArticle,
    		subpages,
    		path,
    		homePath,
    		pageType,
    		folderName,
    		prefix,
    		getFolderName,
    		getRoot
    	});

    	$$self.$inject_state = $$props => {
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(1, defaultLanguage = $$props.defaultLanguage);
    		if ("devModePort" in $$props) $$invalidate(9, devModePort = $$props.devModePort);
    		if ("devMode" in $$props) $$invalidate(8, devMode = $$props.devMode);
    		if ("cmsMode" in $$props) $$invalidate(2, cmsMode = $$props.cmsMode);
    		if ("navbar" in $$props) $$invalidate(3, navbar = $$props.navbar);
    		if ("footer" in $$props) footer = $$props.footer;
    		if ("pageArticle" in $$props) pageArticle = $$props.pageArticle;
    		if ("subpages" in $$props) subpages = $$props.subpages;
    		if ("path" in $$props) $$invalidate(4, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(5, homePath = $$props.homePath);
    		if ("pageType" in $$props) $$invalidate(6, pageType = $$props.pageType);
    		if ("folderName" in $$props) $$invalidate(7, folderName = $$props.folderName);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		language,
    		defaultLanguage,
    		cmsMode,
    		navbar,
    		path,
    		homePath,
    		pageType,
    		folderName,
    		devMode,
    		devModePort,
    		prefix,
    		footer,
    		pageArticle,
    		subpages,
    		navbar_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			language: 0,
    			defaultLanguage: 1,
    			devModePort: 9,
    			devMode: 8,
    			cmsMode: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*language*/ ctx[0] === undefined && !("language" in props)) {
    			console.warn("<App> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[1] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<App> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*devModePort*/ ctx[9] === undefined && !("devModePort" in props)) {
    			console.warn("<App> was created without expected prop 'devModePort'");
    		}

    		if (/*cmsMode*/ ctx[2] === undefined && !("cmsMode" in props)) {
    			console.warn("<App> was created without expected prop 'cmsMode'");
    		}
    	}

    	get language() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get devModePort() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set devModePort(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get devMode() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set devMode(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cmsMode() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cmsMode(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let app = new App({
        target: document.body,
        props: {
            devModePort: '5000',
            defaultLanguage: 'pl',
            languages: ['pl','en'],
            language: 'pl',
            cmsMode: false,
            texts: {'hello': 'Hello!',"navigation":{},"article":{}}
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
