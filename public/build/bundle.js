
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
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (23:8) {#if !(path===homePath || path===homePath+'index.html')}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "mr-auto svelte-1hu5s9b");
    			if (img.src !== (img_src_value = "resources/new_w_logo_horizontal_v1.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 23, 8, 536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(23:8) {#if !(path===homePath || path===homePath+'index.html')}",
    		ctx
    	});

    	return block;
    }

    // (31:16) {#each navlist as list}
    function create_each_block(ctx) {
    	let a;
    	let t_value = /*list*/ ctx[4].label[/*language*/ ctx[2]] + "";
    	let t;
    	let a_href_value;
    	let a_target_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "nav-item nav-link ml-auto mycolor svelte-1hu5s9b");

    			attr_dev(a, "href", a_href_value = /*list*/ ctx[4].url === "/"
    			? /*homePath*/ ctx[1]
    			: /*list*/ ctx[4].url);

    			attr_dev(a, "target", a_target_value = /*list*/ ctx[4].target);
    			add_location(a, file, 31, 16, 1078);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlist, language*/ 12 && t_value !== (t_value = /*list*/ ctx[4].label[/*language*/ ctx[2]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*navlist, homePath*/ 10 && a_href_value !== (a_href_value = /*list*/ ctx[4].url === "/"
    			? /*homePath*/ ctx[1]
    			: /*list*/ ctx[4].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*navlist*/ 8 && a_target_value !== (a_target_value = /*list*/ ctx[4].target)) {
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
    		source: "(31:16) {#each navlist as list}",
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
    	let each_value = /*navlist*/ ctx[3];
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
    			add_location(span, file, 26, 12, 847);
    			attr_dev(button, "class", "navbar-toggler ml-auto");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarNavAltMarkup");
    			attr_dev(button, "aria-controls", "navbarNavAltMarkup");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 25, 8, 636);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file, 29, 12, 990);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarNavAltMarkup");
    			add_location(div0, file, 28, 8, 915);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file, 21, 4, 439);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light bg-light svelte-1hu5s9b");
    			add_location(nav, file, 20, 0, 375);
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
    				if (!if_block) {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*navlist, homePath, language*/ 14) {
    				each_value = /*navlist*/ ctx[3];
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

    	let navlist = [
    		{
    			url: "/",
    			label: { en: "Home", pl: "Home" },
    			target: ""
    		}
    	];

    	onMount(async () => {
    		const res = await fetch(`navigation.json`);
    		$$invalidate(3, navlist = await res.json());
    	});

    	const writable_props = ["path", "homePath", "language"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	$$self.$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		path,
    		homePath,
    		language,
    		navlist
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("navlist" in $$props) $$invalidate(3, navlist = $$props.navlist);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, homePath, language, navlist];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { path: 0, homePath: 1, language: 2 });

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
    			add_location(div0, file_1, 19, 8, 422);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file_1, 18, 4, 390);
    			attr_dev(div2, "class", "jumbotron ft svelte-17l067w");
    			add_location(div2, file_1, 17, 0, 359);
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
    	let content = "";
    	let prefix;

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";
    		const res = await fetch(prefix + file);
    		$$invalidate(0, content = await res.text());
    	});

    	const writable_props = ["file", "language", "defaultLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);

    	$$self.$set = $$props => {
    		if ("file" in $$props) $$invalidate(1, file = $$props.file);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		file,
    		language,
    		defaultLanguage,
    		content,
    		prefix
    	});

    	$$self.$inject_state = $$props => {
    		if ("file" in $$props) $$invalidate(1, file = $$props.file);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, file, language, defaultLanguage];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { file: 1, language: 2, defaultLanguage: 3 });

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
    }

    /* src/components/Logo.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/components/Logo.svelte";

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
    			if (img.src !== (img_src_value = "resources/new_w_logo_horizontal_v1.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "logo_img svelte-psxwx2");
    			add_location(img, file$1, 5, 8, 97);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$1, 4, 4, 53);
    			attr_dev(div1, "class", "jumbotron mybg svelte-psxwx2");
    			add_location(div1, file$1, 3, 0, 20);
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

    function instance$2($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Logo", $$slots, []);
    	return [];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Section.svelte generated by Svelte v3.20.1 */
    const file_1$1 = "src/components/Section.svelte";

    function create_fragment$3(ctx) {
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
    			add_location(img, file_1$1, 19, 16, 463);
    			add_location(br, file_1$1, 19, 63, 510);
    			add_location(h2, file_1$1, 19, 12, 459);
    			add_location(center, file_1$1, 19, 4, 451);
    			attr_dev(hr, "class", "svelte-k6tlcu");
    			add_location(hr, file_1$1, 20, 4, 541);
    			attr_dev(div0, "class", "container section");
    			set_style(div0, "margin-top", "2rem");
    			add_location(div0, file_1$1, 18, 0, 389);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file_1$1, 22, 0, 553);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, center);
    			append_dev(center, h2);
    			append_dev(h2, img);
    			append_dev(h2, br);
    			append_dev(h2, t0);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
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
    	let content;
    	let prefix;

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";
    		const res = await fetch(prefix + file);
    		$$invalidate(2, content = await res.text());
    	});

    	const writable_props = ["title", "icon", "file", "language", "defaultLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Section", $$slots, []);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("file" in $$props) $$invalidate(3, file = $$props.file);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		title,
    		icon,
    		file,
    		language,
    		defaultLanguage,
    		content,
    		prefix
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("file" in $$props) $$invalidate(3, file = $$props.file);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, icon, content, file, language, defaultLanguage];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			title: 0,
    			icon: 1,
    			file: 3,
    			language: 4,
    			defaultLanguage: 5
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

    		if (/*file*/ ctx[3] === undefined && !("file" in props)) {
    			console.warn("<Section> was created without expected prop 'file'");
    		}

    		if (/*language*/ ctx[4] === undefined && !("language" in props)) {
    			console.warn("<Section> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[5] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<Section> was created without expected prop 'defaultLanguage'");
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
    }

    /* src/components/News.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/components/News.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (31:12) {#each config.index as article}
    function create_each_block$1(ctx) {
    	let div;
    	let h3;
    	let a;
    	let t0_value = /*article*/ ctx[5].title + "";
    	let t0;
    	let a_id_value;
    	let t1;
    	let hr;
    	let t2;
    	let html_tag;
    	let raw_value = /*article*/ ctx[5].content + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			t3 = space();
    			attr_dev(a, "id", a_id_value = /*article*/ ctx[5].published);
    			add_location(a, file$2, 32, 46, 1017);
    			attr_dev(h3, "class", "page__main__title");
    			add_location(h3, file$2, 32, 16, 987);
    			attr_dev(hr, "class", "svelte-1qhj8po");
    			add_location(hr, file$2, 33, 16, 1086);
    			html_tag = new HtmlTag(raw_value, t3);
    			attr_dev(div, "class", "text-container");
    			add_location(div, file$2, 31, 12, 942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    			append_dev(div, hr);
    			append_dev(div, t2);
    			html_tag.m(div);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config*/ 2 && t0_value !== (t0_value = /*article*/ ctx[5].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*config*/ 2 && a_id_value !== (a_id_value = /*article*/ ctx[5].published)) {
    				attr_dev(a, "id", a_id_value);
    			}

    			if (dirty & /*config*/ 2 && raw_value !== (raw_value = /*article*/ ctx[5].content + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(31:12) {#each config.index as article}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div0;
    	let h1;
    	let t0_value = /*config*/ ctx[1].title.pl + "";
    	let t0;
    	let t1;
    	let div4;
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div2;
    	let each_value = /*config*/ ctx[1].index;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "title svelte-1qhj8po");
    			add_location(h1, file$2, 22, 4, 660);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$2, 21, 0, 620);
    			if (img.src !== (img_src_value = /*folder*/ ctx[0] + "/icon.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 27, 12, 809);
    			attr_dev(div1, "class", "col-md-3 text-center");
    			add_location(div1, file$2, 26, 8, 762);
    			attr_dev(div2, "class", "col-md-9");
    			add_location(div2, file$2, 29, 8, 863);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$2, 25, 4, 736);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$2, 24, 0, 708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div3, t2);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*config*/ 2 && t0_value !== (t0_value = /*config*/ ctx[1].title.pl + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*folder*/ 1 && img.src !== (img_src_value = /*folder*/ ctx[0] + "/icon.png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*config*/ 2) {
    				each_value = /*config*/ ctx[1].index;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
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
    	let prefix;
    	let config = { "title": "Title", "index": [] };

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";
    		const res = await fetch(prefix + folder + "/index.json");
    		$$invalidate(1, config = await res.json());

    		for (var i = 0; i < config.index.length; i++) {
    			const c = await fetch(prefix + folder + "/" + config.index[i].file);
    			$$invalidate(1, config.index[i].content = await c.text(), config);
    		}

    		$$invalidate(1, config);
    	});

    	const writable_props = ["folder", "language", "defaultLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("News", $$slots, []);

    	$$self.$set = $$props => {
    		if ("folder" in $$props) $$invalidate(0, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		folder,
    		language,
    		defaultLanguage,
    		prefix,
    		config
    	});

    	$$self.$inject_state = $$props => {
    		if ("folder" in $$props) $$invalidate(0, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    		if ("config" in $$props) $$invalidate(1, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [folder, config, language, defaultLanguage];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			folder: 0,
    			language: 2,
    			defaultLanguage: 3
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
    			console.warn("<News> was created without expected prop 'folder'");
    		}

    		if (/*language*/ ctx[2] === undefined && !("language" in props)) {
    			console.warn("<News> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[3] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<News> was created without expected prop 'defaultLanguage'");
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
    }

    /* src/components/Subpage.svelte generated by Svelte v3.20.1 */
    const file$3 = "src/components/Subpage.svelte";

    function create_fragment$5(ctx) {
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div4;
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			attr_dev(h1, "class", "title svelte-1qhj8po");
    			add_location(h1, file$3, 25, 4, 569);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$3, 24, 0, 529);
    			if (img.src !== (img_src_value = "subpages/" + /*name*/ ctx[0] + ".png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$3, 30, 12, 708);
    			attr_dev(div1, "class", "col-md-3 text-center");
    			add_location(div1, file$3, 29, 8, 661);
    			attr_dev(div2, "class", "col-md-9");
    			add_location(div2, file$3, 32, 8, 767);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$3, 28, 4, 635);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$3, 27, 0, 607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			div2.innerHTML = /*content*/ ctx[2];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*name*/ 1 && img.src !== (img_src_value = "subpages/" + /*name*/ ctx[0] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*content*/ 4) div2.innerHTML = /*content*/ ctx[2];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
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
    	let { subpages } = $$props;
    	let { name } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let title;
    	let content;
    	let prefix;

    	onMount(async () => {
    		prefix = language === defaultLanguage ? "" : language + "_";
    		const res = await fetch(prefix + "subpages/" + name + ".html");
    		$$invalidate(2, content = await res.text());

    		try {
    			$$invalidate(1, title = subpages[name].title.pl);
    		} catch(ex) {
    			$$invalidate(1, title = name);
    		}
    	});

    	const writable_props = ["subpages", "name", "language", "defaultLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Subpage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Subpage", $$slots, []);

    	$$self.$set = $$props => {
    		if ("subpages" in $$props) $$invalidate(3, subpages = $$props.subpages);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		subpages,
    		name,
    		language,
    		defaultLanguage,
    		title,
    		content,
    		prefix
    	});

    	$$self.$inject_state = $$props => {
    		if ("subpages" in $$props) $$invalidate(3, subpages = $$props.subpages);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, title, content, subpages, language, defaultLanguage];
    }

    class Subpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			subpages: 3,
    			name: 0,
    			language: 4,
    			defaultLanguage: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subpage",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*subpages*/ ctx[3] === undefined && !("subpages" in props)) {
    			console.warn("<Subpage> was created without expected prop 'subpages'");
    		}

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Subpage> was created without expected prop 'name'");
    		}

    		if (/*language*/ ctx[4] === undefined && !("language" in props)) {
    			console.warn("<Subpage> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[5] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<Subpage> was created without expected prop 'defaultLanguage'");
    		}
    	}

    	get subpages() {
    		throw new Error("<Subpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subpages(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
    }

    /* src/App.svelte generated by Svelte v3.20.1 */
    const file$4 = "src/App.svelte";

    // (84:34) 
    function create_if_block_2(ctx) {
    	let current;

    	const subpage = new Subpage({
    			props: {
    				subpages: /*subpages*/ ctx[3],
    				name: /*folderName*/ ctx[7],
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
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
    			if (dirty & /*subpages*/ 8) subpage_changes.subpages = /*subpages*/ ctx[3];
    			if (dirty & /*folderName*/ 128) subpage_changes.name = /*folderName*/ ctx[7];
    			if (dirty & /*language*/ 1) subpage_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) subpage_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
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
    		source: "(84:34) ",
    		ctx
    	});

    	return block;
    }

    // (82:33) 
    function create_if_block_1(ctx) {
    	let current;

    	const news = new News({
    			props: {
    				folder: /*folderName*/ ctx[7],
    				language: /*language*/ ctx[0],
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
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
    			if (dirty & /*folderName*/ 128) news_changes.folder = /*folderName*/ ctx[7];
    			if (dirty & /*language*/ 1) news_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 2) news_changes.defaultLanguage = /*defaultLanguage*/ ctx[1];
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(82:33) ",
    		ctx
    	});

    	return block;
    }

    // (73:4) {#if 'home'===pageType}
    function create_if_block$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;
    	const logo = new Logo({ $$inline: true });

    	const section0 = new Section({
    			props: {
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
    			create_component(logo.$$.fragment);
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
    			mount_component(logo, target, anchor);
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
    			transition_in(logo.$$.fragment, local);
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
    			transition_out(logo.$$.fragment, local);
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
    			destroy_component(logo, detaching);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(73:4) {#if 'home'===pageType}",
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
    		language: /*language*/ ctx[0]
    	};

    	const navbar_1 = new Navbar({ props: navbar_1_props, $$inline: true });
    	/*navbar_1_binding*/ ctx[14](navbar_1);
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_if_block_2];
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
    				defaultLanguage: /*defaultLanguage*/ ctx[1]
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
    			add_location(main, file$4, 70, 0, 2140);
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

    	// child components which must be binded
    	let navbar;

    	let footer;
    	let pageArticle = { title: "", summary: "", content: "" };
    	let articles = [];
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

    		const res = await fetch(prefix + "subpages/index.json");
    		$$invalidate(3, subpages = await res.json());
    	});

    	const writable_props = ["language", "defaultLanguage", "devModePort", "devMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function navbar_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, navbar = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(1, defaultLanguage = $$props.defaultLanguage);
    		if ("devModePort" in $$props) $$invalidate(9, devModePort = $$props.devModePort);
    		if ("devMode" in $$props) $$invalidate(8, devMode = $$props.devMode);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Navbar,
    		Footer,
    		Logo,
    		Section,
    		News,
    		Subpage,
    		language,
    		defaultLanguage,
    		devModePort,
    		devMode,
    		navbar,
    		footer,
    		pageArticle,
    		articles,
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
    		if ("navbar" in $$props) $$invalidate(2, navbar = $$props.navbar);
    		if ("footer" in $$props) footer = $$props.footer;
    		if ("pageArticle" in $$props) pageArticle = $$props.pageArticle;
    		if ("articles" in $$props) articles = $$props.articles;
    		if ("subpages" in $$props) $$invalidate(3, subpages = $$props.subpages);
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
    		navbar,
    		subpages,
    		path,
    		homePath,
    		pageType,
    		folderName,
    		devMode,
    		devModePort,
    		prefix,
    		footer,
    		pageArticle,
    		articles,
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
    			devMode: 8
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
    }

    let app = new App({
        target: document.body,
        props: {
            devModePort: '5000',
            defaultLanguage: 'pl',
            languages: ['pl','en'],
            language: 'pl',
            texts: {'hello': 'Hello!',"navigation":{},"article":{}}
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
