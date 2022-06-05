
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
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
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (35:8) {#if !(path===homePath || path===homePath+'index.html')}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "mr-auto svelte-q1pdfi");
    			if (img.src !== (img_src_value = /*navlist*/ ctx[4].logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 35, 8, 875);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlist*/ 16 && img.src !== (img_src_value = /*navlist*/ ctx[4].logo)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(35:8) {#if !(path===homePath || path===homePath+'index.html')}",
    		ctx
    	});

    	return block;
    }

    // (43:16) {#each navlist.elements as element}
    function create_each_block_1(ctx) {
    	let a;
    	let t_value = /*element*/ ctx[12].label[/*language*/ ctx[3]] + "";
    	let t;
    	let a_href_value;
    	let a_target_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "nav-item nav-link ml-auto mycolor svelte-q1pdfi");

    			attr_dev(a, "href", a_href_value = /*element*/ ctx[12].url === "/"
    			? /*homePath*/ ctx[1]
    			: /*element*/ ctx[12].url);

    			attr_dev(a, "target", a_target_value = /*element*/ ctx[12].target);
    			add_location(a, file, 43, 16, 1405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlist, language*/ 24 && t_value !== (t_value = /*element*/ ctx[12].label[/*language*/ ctx[3]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*navlist, homePath*/ 18 && a_href_value !== (a_href_value = /*element*/ ctx[12].url === "/"
    			? /*homePath*/ ctx[1]
    			: /*element*/ ctx[12].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*navlist*/ 16 && a_target_value !== (a_target_value = /*element*/ ctx[12].target)) {
    				attr_dev(a, "target", a_target_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(43:16) {#each navlist.elements as element}",
    		ctx
    	});

    	return block;
    }

    // (48:16) {#if languages.length>1}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*languages*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			if (dirty & /*handleLang, languages, language*/ 44) {
    				each_value = /*languages*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(48:16) {#if languages.length>1}",
    		ctx
    	});

    	return block;
    }

    // (50:16) {#if lang!==language}
    function create_if_block_1(ctx) {
    	let a;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[8](/*lang*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "flag svelte-q1pdfi");
    			attr_dev(img, "alt", img_alt_value = /*lang*/ ctx[9]);
    			if (img.src !== (img_src_value = "resources/flags/" + /*lang*/ ctx[9] + ".svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 51, 54, 1855);
    			attr_dev(a, "class", "nav-item nav-link ml-auto mycolor svelte-q1pdfi");
    			add_location(a, file, 50, 20, 1755);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*languages*/ 4 && img_alt_value !== (img_alt_value = /*lang*/ ctx[9])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*languages*/ 4 && img.src !== (img_src_value = "resources/flags/" + /*lang*/ ctx[9] + ".svg")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(50:16) {#if lang!==language}",
    		ctx
    	});

    	return block;
    }

    // (49:16) {#each languages as lang}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*lang*/ ctx[9] !== /*language*/ ctx[3] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*lang*/ ctx[9] !== /*language*/ ctx[3]) {
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(49:16) {#each languages as lang}",
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
    	let t2;
    	let if_block0 = !(/*path*/ ctx[0] === /*homePath*/ ctx[1] || /*path*/ ctx[0] === /*homePath*/ ctx[1] + "index.html") && create_if_block_2(ctx);
    	let each_value_1 = /*navlist*/ ctx[4].elements;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block1 = /*languages*/ ctx[2].length > 1 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			button = element("button");
    			span = element("span");
    			t1 = space();
    			div0 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 38, 12, 1162);
    			attr_dev(button, "class", "navbar-toggler ml-auto");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarNavAltMarkup");
    			attr_dev(button, "aria-controls", "navbarNavAltMarkup");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 37, 8, 951);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file, 41, 12, 1305);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarNavAltMarkup");
    			add_location(div0, file, 40, 8, 1230);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file, 33, 4, 778);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light bg-light svelte-q1pdfi");
    			add_location(nav, file, 32, 0, 714);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t2);
    			if (if_block1) if_block1.m(ul, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!(/*path*/ ctx[0] === /*homePath*/ ctx[1] || /*path*/ ctx[0] === /*homePath*/ ctx[1] + "index.html")) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*navlist, homePath, language*/ 26) {
    				each_value_1 = /*navlist*/ ctx[4].elements;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*languages*/ ctx[2].length > 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
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
    	const dispatch = createEventDispatcher();
    	let { path } = $$props;
    	let { homePath } = $$props;
    	let { languages } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;

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
    		$$invalidate(4, navlist = await contentClient.getJsonFile(`navigation.json`));
    		document.title = navlist.title;
    	});

    	function handleLang(x) {
    		dispatch("setLanguage", { language: x });
    	}

    	const writable_props = ["path", "homePath", "languages", "language", "defaultLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);
    	const click_handler = lang => handleLang(lang);

    	$$self.$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    		if ("languages" in $$props) $$invalidate(2, languages = $$props.languages);
    		if ("language" in $$props) $$invalidate(3, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(6, defaultLanguage = $$props.defaultLanguage);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		path,
    		homePath,
    		languages,
    		language,
    		defaultLanguage,
    		navlist,
    		handleLang
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(1, homePath = $$props.homePath);
    		if ("languages" in $$props) $$invalidate(2, languages = $$props.languages);
    		if ("language" in $$props) $$invalidate(3, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(6, defaultLanguage = $$props.defaultLanguage);
    		if ("navlist" in $$props) $$invalidate(4, navlist = $$props.navlist);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		path,
    		homePath,
    		languages,
    		language,
    		navlist,
    		handleLang,
    		defaultLanguage,
    		dispatch,
    		click_handler
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			path: 0,
    			homePath: 1,
    			languages: 2,
    			language: 3,
    			defaultLanguage: 6
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

    		if (/*languages*/ ctx[2] === undefined && !("languages" in props)) {
    			console.warn("<Navbar> was created without expected prop 'languages'");
    		}

    		if (/*language*/ ctx[3] === undefined && !("language" in props)) {
    			console.warn("<Navbar> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[6] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<Navbar> was created without expected prop 'defaultLanguage'");
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

    	get languages() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set languages(value) {
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
    }

    /* src/components/Jumbotron.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/components/Jumbotron.svelte";

    function create_fragment$1(ctx) {
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
    			attr_dev(img, "class", "logo_img svelte-1ptyz8t");
    			add_location(img, file$1, 7, 8, 325);
    			attr_dev(div0, "class", "container text-center");
    			set_style(div0, "padding", "3rem");
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { homePath: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jumbotron",
    			options,
    			id: create_fragment$1.name
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

    /* src/components/Sections.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/Sections.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].name;
    	child_ctx[10] = list[i].title;
    	child_ctx[11] = list[i].content;
    	child_ctx[12] = list[i].icon;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (41:0) {#each index as {name, title, content, icon}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let center;
    	let h2;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let br;
    	let t0_value = /*title*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let hr;
    	let t2;
    	let div1;
    	let raw_value = /*content*/ ctx[11] + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			center = element("center");
    			h2 = element("h2");
    			img = element("img");
    			br = element("br");
    			t0 = text(t0_value);
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			if (img.src !== (img_src_value = /*icon*/ ctx[12])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50px;");
    			attr_dev(img, "alt", img_alt_value = /*title*/ ctx[10]);
    			set_style(img, "margin-bottom", "1rem");
    			add_location(img, file$2, 44, 16, 1588);
    			add_location(br, file$2, 44, 93, 1665);
    			add_location(h2, file$2, 44, 12, 1584);
    			add_location(center, file$2, 43, 8, 1563);
    			attr_dev(hr, "class", "svelte-1pmci5z");
    			add_location(hr, file$2, 46, 8, 1710);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$2, 42, 4, 1531);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$2, 48, 4, 1730);
    			attr_dev(div2, "class", "section svelte-1pmci5z");
    			set_style(div2, "padding-top", "2rem");
    			set_style(div2, "padding-bottom", "2rem");
    			add_location(div2, file$2, 41, 0, 1456);
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
    			div1.innerHTML = raw_value;
    			append_dev(div2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*index*/ 1 && img.src !== (img_src_value = /*icon*/ ctx[12])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*index*/ 1 && img_alt_value !== (img_alt_value = /*title*/ ctx[10])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*index*/ 1 && t0_value !== (t0_value = /*title*/ ctx[10] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*index*/ 1 && raw_value !== (raw_value = /*content*/ ctx[11] + "")) div1.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(41:0) {#each index as {name, title, content, icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*index*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 1) {
    				each_value = /*index*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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
    	let { folder } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { iconType } = $$props;
    	let prefix = "content/" + (language === defaultLanguage ? "" : language + "_");
    	let index = [{ "name": "" }];
    	let bgcolor = "white";

    	onMount(async () => {
    		loadContent();
    	});

    	async function loadContent() {
    		// get articles
    		try {
    			$$invalidate(0, index = await contentClient.getJsonFile(prefix + folder + "/index.json"));
    		} catch(err) {
    			console.log(err);
    			$$invalidate(0, index = []);
    		}

    		var parser = new DOMParser();

    		for (var i = 0; i < index.length; i++) {
    			$$invalidate(0, index[i].content = await contentClient.getTextFile(prefix + folder + "/" + index[i].name), index);
    			$$invalidate(0, index[i].icon = prefix + folder + "/" + index[i].name.substring(0, index[i].name.lastIndexOf(".")) + "." + iconType, index);
    			var doc = parser.parseFromString(index[i].content, "text/html");

    			try {
    				$$invalidate(0, index[i].title = doc.querySelector("article header title").innerHTML, index);
    			} catch(ex) {
    				$$invalidate(0, index[i].title = index[i].name, index);
    			}
    		}
    	}

    	function languageChanged(newLanguage) {
    		$$invalidate(1, language = newLanguage);
    		prefix = "content/" + (language === defaultLanguage ? "" : language + "_");
    		loadContent();
    	}

    	const writable_props = ["folder", "language", "defaultLanguage", "iconType"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Sections> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Sections", $$slots, []);

    	$$self.$set = $$props => {
    		if ("folder" in $$props) $$invalidate(2, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    		if ("iconType" in $$props) $$invalidate(4, iconType = $$props.iconType);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		folder,
    		language,
    		defaultLanguage,
    		iconType,
    		prefix,
    		index,
    		bgcolor,
    		loadContent,
    		languageChanged
    	});

    	$$self.$inject_state = $$props => {
    		if ("folder" in $$props) $$invalidate(2, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    		if ("iconType" in $$props) $$invalidate(4, iconType = $$props.iconType);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("bgcolor" in $$props) bgcolor = $$props.bgcolor;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [index, language, folder, defaultLanguage, iconType, languageChanged];
    }

    class Sections extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			folder: 2,
    			language: 1,
    			defaultLanguage: 3,
    			iconType: 4,
    			languageChanged: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sections",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*folder*/ ctx[2] === undefined && !("folder" in props)) {
    			console_1.warn("<Sections> was created without expected prop 'folder'");
    		}

    		if (/*language*/ ctx[1] === undefined && !("language" in props)) {
    			console_1.warn("<Sections> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[3] === undefined && !("defaultLanguage" in props)) {
    			console_1.warn("<Sections> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*iconType*/ ctx[4] === undefined && !("iconType" in props)) {
    			console_1.warn("<Sections> was created without expected prop 'iconType'");
    		}
    	}

    	get folder() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set folder(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconType() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconType(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get languageChanged() {
    		return this.$$.ctx[5];
    	}

    	set languageChanged(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/News.svelte generated by Svelte v3.20.1 */
    const file$3 = "src/components/News.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i].uid;
    	child_ctx[12] = list[i].name;
    	child_ctx[13] = list[i].content;
    	child_ctx[14] = list[i].comments;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (106:16) {#if homePath==='/'}
    function create_if_block$1(ctx) {
    	let hr;
    	let t0;
    	let div3;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2_value = /*config*/ ctx[4].link[/*language*/ ctx[0]] + "";
    	let t2;
    	let a0_href_value;
    	let a0_onclick_value;
    	let t3;
    	let div1;
    	let t4_value = /*config*/ ctx[4].comments[/*language*/ ctx[0]] + "";
    	let t4;
    	let t5;
    	let t6_value = getLength(/*comments*/ ctx[14]) + "";
    	let t6;
    	let t7;
    	let div2;
    	let a1;
    	let t8_value = /*config*/ ctx[4].send[/*language*/ ctx[0]] + "";
    	let t8;
    	let a1_href_value;
    	let t9;
    	let show_if = getLength(/*comments*/ ctx[14]) > 0;
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_1$1(ctx);

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
    			attr_dev(hr, "class", "comments svelte-j4y6p9");
    			add_location(hr, file$3, 106, 16, 3233);
    			if (img.src !== (img_src_value = "/resources/link.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$3, 113, 25, 3606);
    			attr_dev(a0, "class", "permalink svelte-j4y6p9");
    			attr_dev(a0, "href", a0_href_value = "#" + /*uid*/ ctx[11]);
    			attr_dev(a0, "onclick", a0_onclick_value = "prompt('" + /*config*/ ctx[4].prompt[/*language*/ ctx[0]] + "','" + /*config*/ ctx[4].siteUrl + /*homePath*/ ctx[2] + /*folder*/ ctx[1] + ".html#" + /*uid*/ ctx[11] + "'); return false;");
    			add_location(a0, file$3, 109, 24, 3362);
    			attr_dev(div0, "class", "col-4");
    			add_location(div0, file$3, 108, 20, 3318);
    			attr_dev(div1, "class", "col-4");
    			add_location(div1, file$3, 115, 20, 3714);
    			attr_dev(a1, "class", "btn btn-sm btn-outline-secondary");
    			attr_dev(a1, "role", "button");
    			attr_dev(a1, "href", a1_href_value = "mailto:" + /*config*/ ctx[4].email + "?subject=ID:" + /*uid*/ ctx[11] + "&body=" + /*commentDisclaimer*/ ctx[7]);
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$3, 117, 24, 3865);
    			attr_dev(div2, "class", "col-4 text-right");
    			add_location(div2, file$3, 116, 20, 3810);
    			attr_dev(div3, "class", "row comments svelte-j4y6p9");
    			add_location(div3, file$3, 107, 16, 3271);
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
    			if (dirty & /*config, language*/ 17 && t2_value !== (t2_value = /*config*/ ctx[4].link[/*language*/ ctx[0]] + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*index*/ 32 && a0_href_value !== (a0_href_value = "#" + /*uid*/ ctx[11])) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*config, language, homePath, folder, index*/ 55 && a0_onclick_value !== (a0_onclick_value = "prompt('" + /*config*/ ctx[4].prompt[/*language*/ ctx[0]] + "','" + /*config*/ ctx[4].siteUrl + /*homePath*/ ctx[2] + /*folder*/ ctx[1] + ".html#" + /*uid*/ ctx[11] + "'); return false;")) {
    				attr_dev(a0, "onclick", a0_onclick_value);
    			}

    			if (dirty & /*config, language*/ 17 && t4_value !== (t4_value = /*config*/ ctx[4].comments[/*language*/ ctx[0]] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*index*/ 32 && t6_value !== (t6_value = getLength(/*comments*/ ctx[14]) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*config, language*/ 17 && t8_value !== (t8_value = /*config*/ ctx[4].send[/*language*/ ctx[0]] + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*config, index, commentDisclaimer*/ 176 && a1_href_value !== (a1_href_value = "mailto:" + /*config*/ ctx[4].email + "?subject=ID:" + /*uid*/ ctx[11] + "&body=" + /*commentDisclaimer*/ ctx[7])) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*index*/ 32) show_if = getLength(/*comments*/ ctx[14]) > 0;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
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
    		source: "(106:16) {#if homePath==='/'}",
    		ctx
    	});

    	return block;
    }

    // (123:16) {#if getLength(comments)>0}
    function create_if_block_1$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*comments*/ ctx[14];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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
    			if (dirty & /*index*/ 32) {
    				each_value_1 = /*comments*/ ctx[14];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(123:16) {#if getLength(comments)>0}",
    		ctx
    	});

    	return block;
    }

    // (124:16) {#each comments as comment}
    function create_each_block_1$1(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*comment*/ ctx[17].date + "";
    	let t0;
    	let t1;
    	let i;
    	let t2_value = /*comment*/ ctx[17].email + "";
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let t4_value = /*comment*/ ctx[17].text + "";
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
    			add_location(i, file$3, 125, 55, 4336);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file$3, 125, 20, 4301);
    			attr_dev(div1, "class", "row comment-header svelte-j4y6p9");
    			add_location(div1, file$3, 124, 16, 4248);
    			attr_dev(div2, "class", "col-12");
    			add_location(div2, file$3, 128, 20, 4450);
    			attr_dev(div3, "class", "row comment svelte-j4y6p9");
    			add_location(div3, file$3, 127, 16, 4404);
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
    			if (dirty & /*index*/ 32 && t0_value !== (t0_value = /*comment*/ ctx[17].date + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*index*/ 32 && t2_value !== (t2_value = /*comment*/ ctx[17].email + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*index*/ 32 && t4_value !== (t4_value = /*comment*/ ctx[17].text + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(124:16) {#each comments as comment}",
    		ctx
    	});

    	return block;
    }

    // (102:12) {#each index as {uid, name, content, comments}
    function create_each_block$2(ctx) {
    	let div;
    	let a;
    	let a_id_value;
    	let t0;
    	let html_tag;
    	let raw_value = /*content*/ ctx[13] + "";
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
    			attr_dev(a, "id", a_id_value = /*uid*/ ctx[11]);
    			add_location(a, file$3, 103, 16, 3129);
    			html_tag = new HtmlTag(raw_value, t1);
    			attr_dev(div, "class", "container");
    			add_location(div, file$3, 102, 12, 3089);
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
    			if (dirty & /*index*/ 32 && a_id_value !== (a_id_value = /*uid*/ ctx[11])) {
    				attr_dev(a, "id", a_id_value);
    			}

    			if (dirty & /*index*/ 32 && raw_value !== (raw_value = /*content*/ ctx[13] + "")) html_tag.p(raw_value);

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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(102:12) {#each index as {uid, name, content, comments}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t0_value = /*config*/ ctx[4].title[/*language*/ ctx[0]] + "";
    	let t0;
    	let t1;
    	let div5;
    	let div4;
    	let div2;
    	let img;
    	let img_src_value;
    	let t2;
    	let div3;
    	let each_value = /*index*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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

    			attr_dev(h1, "class", "title svelte-j4y6p9");
    			add_location(h1, file$3, 92, 8, 2741);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$3, 91, 4, 2697);
    			set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[6] + ")");
    			add_location(div1, file$3, 89, 0, 2555);
    			if (img.src !== (img_src_value = /*prefix*/ ctx[3] + /*folder*/ ctx[1] + "/icon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "subpage_img svelte-j4y6p9");
    			add_location(img, file$3, 98, 12, 2908);
    			attr_dev(div2, "class", "col-md-3 text-center");
    			add_location(div2, file$3, 97, 8, 2861);
    			attr_dev(div3, "class", "col-md-9");
    			add_location(div3, file$3, 100, 8, 2989);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$3, 96, 4, 2835);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$3, 95, 0, 2807);
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
    			if (dirty & /*config, language*/ 17 && t0_value !== (t0_value = /*config*/ ctx[4].title[/*language*/ ctx[0]] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*bgImgLocation*/ 64) {
    				set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[6] + ")");
    			}

    			if (dirty & /*prefix, folder*/ 10 && img.src !== (img_src_value = /*prefix*/ ctx[3] + /*folder*/ ctx[1] + "/icon.png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*index, getLength, config, commentDisclaimer, language, homePath, folder*/ 183) {
    				each_value = /*index*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getLength(arr) {
    	let l = 0;

    	try {
    		l = arr.length;
    	} catch {
    		
    	}

    	return l;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { folder } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { homePath } = $$props;
    	let prefix = "content/" + (language === defaultLanguage ? "" : language + "_");

    	let config = {
    		"title": { "pl": "", "en": "" },
    		"email": "",
    		"siteUrl": "",
    		"disclaimer": { "pl": "", "en": "" },
    		"prompt": { "pl": "", "en": "" },
    		"link": { "pl": "", "en": "" },
    		"comments": { "pl": "", "en": "" },
    		"send": { "pl": "", "en": "" }
    	};

    	let index = [
    		{
    			"uid": "",
    			"name": "",
    			"isComment": false,
    			"comments": []
    		}
    	];

    	let bgImgLocation;
    	let commentDisclaimer = "";

    	// commentsForOneArticle = [{email: "x@y", date: "2020-03-21", text: "mój komentarz"}, {email: "aa@bb.cc", date: "2020-03-22", text: "mój 2 komentarz"}];
    	onMount(async () => {
    		$$invalidate(6, bgImgLocation = homePath + "resources/jumbotron.png");
    		loadContent();
    	});

    	async function loadContent() {
    		// get news config
    		try {
    			$$invalidate(4, config = await contentClient.getJsonFile(prefix + folder + "/config.json"));
    		} catch(err) {
    			$$invalidate(5, index = []);
    			return;
    		}

    		$$invalidate(7, commentDisclaimer = "%0D%0A%0D%0A" + encodeURI(config.disclaimer[language]));

    		// get articles
    		try {
    			$$invalidate(5, index = await contentClient.getJsonFile(prefix + folder + "/index.json"));
    		} catch(err) {
    			$$invalidate(5, index = []);
    		}

    		for (var i = 0; i < index.length; i++) {
    			$$invalidate(5, index[i].uid = index[i].name.substring(0, index[i].name.lastIndexOf(".")), index);
    			$$invalidate(5, index[i].content = await contentClient.getTextFile(prefix + folder + "/" + index[i].name), index);

    			if (index[i].isComment) {
    				$$invalidate(5, index[i].comments = await contentClient.getJsonFile(prefix + folder + "/" + index[i].uid + ".json"), index);
    			} else {
    				$$invalidate(5, index[i].comments = [], index);
    			}
    		}

    		$$invalidate(5, index);
    	}

    	function languageChanged(newLanguage) {
    		$$invalidate(0, language = newLanguage);
    		$$invalidate(3, prefix = "content/" + (language === defaultLanguage ? "" : language + "_"));
    		loadContent();
    	}

    	const writable_props = ["folder", "language", "defaultLanguage", "homePath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("News", $$slots, []);

    	$$self.$set = $$props => {
    		if ("folder" in $$props) $$invalidate(1, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(8, defaultLanguage = $$props.defaultLanguage);
    		if ("homePath" in $$props) $$invalidate(2, homePath = $$props.homePath);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		folder,
    		language,
    		defaultLanguage,
    		homePath,
    		prefix,
    		config,
    		index,
    		bgImgLocation,
    		commentDisclaimer,
    		loadContent,
    		getLength,
    		languageChanged
    	});

    	$$self.$inject_state = $$props => {
    		if ("folder" in $$props) $$invalidate(1, folder = $$props.folder);
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(8, defaultLanguage = $$props.defaultLanguage);
    		if ("homePath" in $$props) $$invalidate(2, homePath = $$props.homePath);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    		if ("config" in $$props) $$invalidate(4, config = $$props.config);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("bgImgLocation" in $$props) $$invalidate(6, bgImgLocation = $$props.bgImgLocation);
    		if ("commentDisclaimer" in $$props) $$invalidate(7, commentDisclaimer = $$props.commentDisclaimer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		language,
    		folder,
    		homePath,
    		prefix,
    		config,
    		index,
    		bgImgLocation,
    		commentDisclaimer,
    		defaultLanguage,
    		languageChanged
    	];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			folder: 1,
    			language: 0,
    			defaultLanguage: 8,
    			homePath: 2,
    			languageChanged: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*folder*/ ctx[1] === undefined && !("folder" in props)) {
    			console.warn("<News> was created without expected prop 'folder'");
    		}

    		if (/*language*/ ctx[0] === undefined && !("language" in props)) {
    			console.warn("<News> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[8] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<News> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*homePath*/ ctx[2] === undefined && !("homePath" in props)) {
    			console.warn("<News> was created without expected prop 'homePath'");
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

    	get homePath() {
    		throw new Error("<News>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set homePath(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get languageChanged() {
    		return this.$$.ctx[9];
    	}

    	set languageChanged(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Subpage.svelte generated by Svelte v3.20.1 */
    const file$4 = "src/components/Subpage.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(h1, file$4, 35, 8, 1170);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$4, 34, 4, 1126);
    			set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[3] + ")");
    			add_location(div1, file$4, 32, 0, 984);
    			if (img.src !== (img_src_value = "content/subpages/" + /*name*/ ctx[0] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "subpage_img svelte-o10zcn");
    			add_location(img, file$4, 41, 12, 1320);
    			attr_dev(div2, "class", "col-md-3 text-center");
    			add_location(div2, file$4, 40, 8, 1273);
    			attr_dev(div3, "class", "col-md-9");
    			add_location(div3, file$4, 43, 8, 1407);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$4, 39, 4, 1247);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$4, 38, 0, 1219);
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

    			if (dirty & /*name*/ 1 && img.src !== (img_src_value = "content/subpages/" + /*name*/ ctx[0] + ".png")) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { homePath } = $$props;
    	let title = "title";
    	let content = "";
    	let prefix = "content/" + (language === defaultLanguage ? "" : language + "_");
    	let bgImgLocation = homePath + "resources/jumbotron.png";

    	onMount(async () => {
    		loadContent();
    	});

    	async function loadContent() {
    		$$invalidate(2, content = await contentClient.getTextFile(prefix + "subpages/" + name + ".html"));
    		var parser = new DOMParser();
    		var doc = parser.parseFromString(content, "text/html");

    		try {
    			$$invalidate(1, title = doc.querySelector("article header title").innerHTML);
    		} catch(ex) {
    			$$invalidate(1, title = name);
    		}
    	}

    	function languageChanged(newLanguage) {
    		$$invalidate(4, language = newLanguage);
    		prefix = "content/" + (language === defaultLanguage ? "" : language + "_");
    		loadContent();
    	}

    	const writable_props = ["name", "language", "defaultLanguage", "homePath"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Subpage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Subpage", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("homePath" in $$props) $$invalidate(6, homePath = $$props.homePath);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		name,
    		language,
    		defaultLanguage,
    		homePath,
    		title,
    		content,
    		prefix,
    		bgImgLocation,
    		loadContent,
    		languageChanged
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("homePath" in $$props) $$invalidate(6, homePath = $$props.homePath);
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
    		homePath,
    		languageChanged
    	];
    }

    class Subpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			name: 0,
    			language: 4,
    			defaultLanguage: 5,
    			homePath: 6,
    			languageChanged: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subpage",
    			options,
    			id: create_fragment$4.name
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

    		if (/*homePath*/ ctx[6] === undefined && !("homePath" in props)) {
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

    	get homePath() {
    		throw new Error("<Subpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set homePath(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get languageChanged() {
    		return this.$$.ctx[7];
    	}

    	set languageChanged(value) {
    		throw new Error("<Subpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SubpageMd.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;
    const file$5 = "src/components/SubpageMd.svelte";

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
    			attr_dev(h1, "class", "title svelte-13s93me");
    			add_location(h1, file$5, 57, 8, 1971);
    			attr_dev(div0, "class", "container text-center");
    			add_location(div0, file$5, 56, 4, 1927);
    			set_style(div1, "background-image", "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url(" + /*bgImgLocation*/ ctx[3] + ")");
    			add_location(div1, file$5, 54, 0, 1785);
    			if (img.src !== (img_src_value = "content/subpages/" + /*name*/ ctx[0] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "subpage_img svelte-13s93me");
    			add_location(img, file$5, 63, 12, 2121);
    			attr_dev(div2, "class", "col-md-3 text-center");
    			add_location(div2, file$5, 62, 8, 2074);
    			attr_dev(div3, "class", "col-md-9");
    			add_location(div3, file$5, 65, 8, 2208);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$5, 61, 4, 2048);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$5, 60, 0, 2020);
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

    			if (dirty & /*name*/ 1 && img.src !== (img_src_value = "content/subpages/" + /*name*/ ctx[0] + ".png")) {
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
    	let { homePath } = $$props;

    	const classMap = {
    		table: "table-bordered table-sm",
    		blockquote: "blockquote"
    	};

    	const bindings = Object.keys(classMap).map(key => ({
    		type: "output",
    		regex: new RegExp(`<${key}(.*)>`, "g"),
    		replace: `<${key} class="${classMap[key]}" $1>`
    	}));

    	let title = "title";
    	let published = "";
    	let content = "";
    	let prefix = "content/" + (language === defaultLanguage ? "" : language + "_");
    	let bgImgLocation = homePath + "resources/jumbotron.png";

    	let converter = new showdown.Converter({
    			tables: true,
    			simpleLineBreaks: true,
    			simplifiedAutoLink: true,
    			extensions: [...bindings]
    		});

    	onMount(async () => {
    		loadContent();
    	});

    	async function loadContent() {
    		$$invalidate(2, content = await contentClient.getTextFile(prefix + "subpages/" + name + ".md"));

    		if (content.startsWith("# ")) {
    			$$invalidate(1, title = content.substring(2, content.indexOf("## ")));

    			if (title.indexOf("//") > 0) {
    				published = title.substring(title.indexOf("//") + 2).trim();
    				$$invalidate(1, title = title.substring(0, title.indexOf("//")).trim());
    			}

    			$$invalidate(2, content = content.substring(content.indexOf("## ")));
    		}

    		$$invalidate(2, content = converter.makeHtml(content));
    	}

    	function languageChanged(newLanguage) {
    		$$invalidate(4, language = newLanguage);
    		prefix = "content/" + (language === defaultLanguage ? "" : language + "_");
    		loadContent();
    	}

    	const writable_props = ["name", "language", "defaultLanguage", "homePath"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SubpageMd> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SubpageMd", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("homePath" in $$props) $$invalidate(6, homePath = $$props.homePath);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		name,
    		language,
    		defaultLanguage,
    		homePath,
    		classMap,
    		bindings,
    		title,
    		published,
    		content,
    		prefix,
    		bgImgLocation,
    		converter,
    		loadContent,
    		languageChanged
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("language" in $$props) $$invalidate(4, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(5, defaultLanguage = $$props.defaultLanguage);
    		if ("homePath" in $$props) $$invalidate(6, homePath = $$props.homePath);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("published" in $$props) published = $$props.published;
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    		if ("bgImgLocation" in $$props) $$invalidate(3, bgImgLocation = $$props.bgImgLocation);
    		if ("converter" in $$props) converter = $$props.converter;
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
    		homePath,
    		languageChanged
    	];
    }

    class SubpageMd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			name: 0,
    			language: 4,
    			defaultLanguage: 5,
    			homePath: 6,
    			languageChanged: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SubpageMd",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<SubpageMd> was created without expected prop 'name'");
    		}

    		if (/*language*/ ctx[4] === undefined && !("language" in props)) {
    			console.warn("<SubpageMd> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[5] === undefined && !("defaultLanguage" in props)) {
    			console.warn("<SubpageMd> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*homePath*/ ctx[6] === undefined && !("homePath" in props)) {
    			console.warn("<SubpageMd> was created without expected prop 'homePath'");
    		}
    	}

    	get name() {
    		throw new Error("<SubpageMd>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SubpageMd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<SubpageMd>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<SubpageMd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultLanguage() {
    		throw new Error("<SubpageMd>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultLanguage(value) {
    		throw new Error("<SubpageMd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get homePath() {
    		throw new Error("<SubpageMd>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set homePath(value) {
    		throw new Error("<SubpageMd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get languageChanged() {
    		return this.$$.ctx[7];
    	}

    	set languageChanged(value) {
    		throw new Error("<SubpageMd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.20.1 */
    const file_1 = "src/components/Footer.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "row");
    			set_style(div0, "padding-top", "1rem");
    			set_style(div0, "padding-bottom", "1rem");
    			add_location(div0, file_1, 26, 8, 684);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file_1, 25, 4, 652);
    			attr_dev(div2, "class", "jumbotron ft svelte-1aaugve");
    			add_location(div2, file_1, 24, 0, 621);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { file } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let content = "";
    	let prefix = "content/" + (language === defaultLanguage ? "" : language + "_");

    	onMount(async () => {
    		loadContent();
    	});

    	async function loadContent() {
    		$$invalidate(0, content = await contentClient.getTextFile(prefix + file));
    	}

    	function languageChanged(newLanguage) {
    		$$invalidate(1, language = newLanguage);
    		prefix = "content/" + (language === defaultLanguage ? "" : language + "_");
    		loadContent();
    	}

    	const writable_props = ["file", "language", "defaultLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);

    	$$self.$set = $$props => {
    		if ("file" in $$props) $$invalidate(2, file = $$props.file);
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		file,
    		language,
    		defaultLanguage,
    		content,
    		prefix,
    		loadContent,
    		languageChanged
    	});

    	$$self.$inject_state = $$props => {
    		if ("file" in $$props) $$invalidate(2, file = $$props.file);
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(3, defaultLanguage = $$props.defaultLanguage);
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("prefix" in $$props) prefix = $$props.prefix;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, language, file, defaultLanguage, languageChanged];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			file: 2,
    			language: 1,
    			defaultLanguage: 3,
    			languageChanged: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*file*/ ctx[2] === undefined && !("file" in props)) {
    			console.warn("<Footer> was created without expected prop 'file'");
    		}

    		if (/*language*/ ctx[1] === undefined && !("language" in props)) {
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

    	get languageChanged() {
    		return this.$$.ctx[4];
    	}

    	set languageChanged(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/App.svelte";

    // (115:79) 
    function create_if_block_3(ctx) {
    	let current;

    	let subpagemd_props = {
    		homePath: /*homePath*/ ctx[10],
    		name: /*folderName*/ ctx[12],
    		language: /*language*/ ctx[0],
    		defaultLanguage: /*defaultLanguage*/ ctx[2]
    	};

    	const subpagemd = new SubpageMd({ props: subpagemd_props, $$inline: true });
    	/*subpagemd_binding*/ ctx[25](subpagemd);

    	const block = {
    		c: function create() {
    			create_component(subpagemd.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subpagemd, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const subpagemd_changes = {};
    			if (dirty & /*homePath*/ 1024) subpagemd_changes.homePath = /*homePath*/ ctx[10];
    			if (dirty & /*folderName*/ 4096) subpagemd_changes.name = /*folderName*/ ctx[12];
    			if (dirty & /*language*/ 1) subpagemd_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 4) subpagemd_changes.defaultLanguage = /*defaultLanguage*/ ctx[2];
    			subpagemd.$set(subpagemd_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subpagemd.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subpagemd.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*subpagemd_binding*/ ctx[25](null);
    			destroy_component(subpagemd, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(115:79) ",
    		ctx
    	});

    	return block;
    }

    // (113:84) 
    function create_if_block_2$1(ctx) {
    	let current;

    	let subpage_1_props = {
    		homePath: /*homePath*/ ctx[10],
    		name: /*folderName*/ ctx[12],
    		language: /*language*/ ctx[0],
    		defaultLanguage: /*defaultLanguage*/ ctx[2]
    	};

    	const subpage_1 = new Subpage({ props: subpage_1_props, $$inline: true });
    	/*subpage_1_binding*/ ctx[24](subpage_1);

    	const block = {
    		c: function create() {
    			create_component(subpage_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subpage_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const subpage_1_changes = {};
    			if (dirty & /*homePath*/ 1024) subpage_1_changes.homePath = /*homePath*/ ctx[10];
    			if (dirty & /*folderName*/ 4096) subpage_1_changes.name = /*folderName*/ ctx[12];
    			if (dirty & /*language*/ 1) subpage_1_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 4) subpage_1_changes.defaultLanguage = /*defaultLanguage*/ ctx[2];
    			subpage_1.$set(subpage_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subpage_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subpage_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*subpage_1_binding*/ ctx[24](null);
    			destroy_component(subpage_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(113:84) ",
    		ctx
    	});

    	return block;
    }

    // (111:33) 
    function create_if_block_1$2(ctx) {
    	let current;

    	let news_1_props = {
    		homePath: /*homePath*/ ctx[10],
    		folder: /*folderName*/ ctx[12],
    		language: /*language*/ ctx[0],
    		defaultLanguage: /*defaultLanguage*/ ctx[2]
    	};

    	const news_1 = new News({ props: news_1_props, $$inline: true });
    	/*news_1_binding*/ ctx[23](news_1);

    	const block = {
    		c: function create() {
    			create_component(news_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(news_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const news_1_changes = {};
    			if (dirty & /*homePath*/ 1024) news_1_changes.homePath = /*homePath*/ ctx[10];
    			if (dirty & /*folderName*/ 4096) news_1_changes.folder = /*folderName*/ ctx[12];
    			if (dirty & /*language*/ 1) news_1_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 4) news_1_changes.defaultLanguage = /*defaultLanguage*/ ctx[2];
    			news_1.$set(news_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(news_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(news_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*news_1_binding*/ ctx[23](null);
    			destroy_component(news_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(111:33) ",
    		ctx
    	});

    	return block;
    }

    // (108:4) {#if 'home'===pageType}
    function create_if_block$2(ctx) {
    	let t;
    	let current;

    	const jumbotron = new Jumbotron({
    			props: { homePath: /*homePath*/ ctx[10] },
    			$$inline: true
    		});

    	let sections_1_props = {
    		folder: "sections",
    		iconType: "png",
    		language: /*language*/ ctx[0],
    		defaultLanguage: /*defaultLanguage*/ ctx[2]
    	};

    	const sections_1 = new Sections({ props: sections_1_props, $$inline: true });
    	/*sections_1_binding*/ ctx[22](sections_1);

    	const block = {
    		c: function create() {
    			create_component(jumbotron.$$.fragment);
    			t = space();
    			create_component(sections_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jumbotron, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(sections_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const jumbotron_changes = {};
    			if (dirty & /*homePath*/ 1024) jumbotron_changes.homePath = /*homePath*/ ctx[10];
    			jumbotron.$set(jumbotron_changes);
    			const sections_1_changes = {};
    			if (dirty & /*language*/ 1) sections_1_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 4) sections_1_changes.defaultLanguage = /*defaultLanguage*/ ctx[2];
    			sections_1.$set(sections_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jumbotron.$$.fragment, local);
    			transition_in(sections_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jumbotron.$$.fragment, local);
    			transition_out(sections_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jumbotron, detaching);
    			if (detaching) detach_dev(t);
    			/*sections_1_binding*/ ctx[22](null);
    			destroy_component(sections_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(108:4) {#if 'home'===pageType}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let t0;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let current;

    	let navbar_1_props = {
    		path: /*path*/ ctx[9],
    		homePath: /*homePath*/ ctx[10],
    		languages: /*languages*/ ctx[1],
    		language: /*language*/ ctx[0],
    		defaultLanguage: /*defaultLanguage*/ ctx[2]
    	};

    	const navbar_1 = new Navbar({ props: navbar_1_props, $$inline: true });
    	/*navbar_1_binding*/ ctx[21](navbar_1);
    	navbar_1.$on("setLanguage", /*handleSetLanguage*/ ctx[13]);
    	const if_block_creators = [create_if_block$2, create_if_block_1$2, create_if_block_2$1, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if ("home" === /*pageType*/ ctx[11]) return 0;
    		if ("multi" === /*pageType*/ ctx[11]) return 1;
    		if ("single.html" === /*pageType*/ ctx[11] || "single" === /*pageType*/ ctx[11] && /*syntax*/ ctx[3] === "html") return 2;
    		if ("single.md" === /*pageType*/ ctx[11] || "single" === /*pageType*/ ctx[11] && /*syntax*/ ctx[3] === "md") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let footer_1_props = {
    		file: "sections/footer.html",
    		language: /*language*/ ctx[0],
    		defaultLanguage: /*defaultLanguage*/ ctx[2]
    	};

    	const footer_1 = new Footer({ props: footer_1_props, $$inline: true });
    	/*footer_1_binding*/ ctx[26](footer_1);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar_1.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(footer_1.$$.fragment);
    			add_location(main, file$6, 104, 0, 3655);
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
    			if (dirty & /*path*/ 512) navbar_1_changes.path = /*path*/ ctx[9];
    			if (dirty & /*homePath*/ 1024) navbar_1_changes.homePath = /*homePath*/ ctx[10];
    			if (dirty & /*languages*/ 2) navbar_1_changes.languages = /*languages*/ ctx[1];
    			if (dirty & /*language*/ 1) navbar_1_changes.language = /*language*/ ctx[0];
    			if (dirty & /*defaultLanguage*/ 4) navbar_1_changes.defaultLanguage = /*defaultLanguage*/ ctx[2];
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
    			if (dirty & /*defaultLanguage*/ 4) footer_1_changes.defaultLanguage = /*defaultLanguage*/ ctx[2];
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
    			/*navbar_1_binding*/ ctx[21](null);
    			destroy_component(navbar_1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*footer_1_binding*/ ctx[26](null);
    			destroy_component(footer_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
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

    function instance$7($$self, $$props, $$invalidate) {
    	let { languages = [] } = $$props;
    	let { language } = $$props;
    	let { defaultLanguage } = $$props;
    	let { devModePort } = $$props;
    	let { devMode = false } = $$props;
    	let { cmsMode } = $$props;
    	let { syntax } = $$props;

    	// child components which must be binded
    	let navbar;

    	let news;
    	let subpage;
    	let footer;
    	let sections;
    	let path;
    	let homePath;
    	let pageType;
    	let folderName;
    	let queryLanguage;
    	let index = [];
    	let prefix; // = language === defaultLanguage ? '' : language + '_';
    	let tmpLang = window.localStorage.getItem("language");

    	if (languages.length > 1 && "" != tmpLang && "null" != tmpLang && undefined != tmpLang) {
    		language = tmpLang;
    	} else {
    		language = defaultLanguage;
    	}

    	prefix = language === defaultLanguage ? "" : language + "_";

    	onMount(async () => {
    		$$invalidate(9, path = window.location.pathname);
    		queryLanguage = window.location.search;

    		if (queryLanguage.indexOf("?lang=") > -1) {
    			queryLanguage = queryLanguage.substring(queryLanguage.indexOf("?lang=") + 6);

    			if (queryLanguage.indexOf("&") > 0) {
    				queryLanguage = queryLanguage.substring(0, queryLanguage.indexOf("&"));
    			}
    		}

    		if (queryLanguage.length > 0 && languages.includes(queryLanguage)) {
    			$$invalidate(0, language = queryLanguage);
    			prefix = language === defaultLanguage ? "" : language + "_";
    		}

    		console.log("queryLanguage:" + queryLanguage);
    		console.log("language:" + language);
    		$$invalidate(14, devMode = window.origin.endsWith(":" + devModePort));

    		if (!devMode && window.location.hostname !== "localhost" && window.location.protocol !== "https:") {
    			window.location.protocol = "https:";
    		}

    		$$invalidate(11, pageType = window.localStorage.getItem("pageType"));
    		$$invalidate(12, folderName = getFolderName(window.location.pathname));
    		$$invalidate(10, homePath = getRoot(path));
    		contentClient.setCmsMode(cmsMode);
    	});

    	function handleSetLanguage(event) {
    		$$invalidate(0, language = event.detail.language);
    		prefix = language === defaultLanguage ? "" : language + "_";
    		window.localStorage.setItem("language", language);

    		if (typeof news !== "undefined") {
    			news.languageChanged(language);
    		}

    		if (typeof footer !== "undefined") {
    			footer.languageChanged(language);
    		}

    		if (typeof subpage !== "undefined") {
    			subpage.languageChanged(language);
    		}

    		if (typeof sections !== "undefined") {
    			sections.languageChanged(language);
    		}
    	}

    	const writable_props = [
    		"languages",
    		"language",
    		"defaultLanguage",
    		"devModePort",
    		"devMode",
    		"cmsMode",
    		"syntax"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function navbar_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, navbar = $$value);
    		});
    	}

    	function sections_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(8, sections = $$value);
    		});
    	}

    	function news_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(5, news = $$value);
    		});
    	}

    	function subpage_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(6, subpage = $$value);
    		});
    	}

    	function subpagemd_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(6, subpage = $$value);
    		});
    	}

    	function footer_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(7, footer = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("languages" in $$props) $$invalidate(1, languages = $$props.languages);
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(2, defaultLanguage = $$props.defaultLanguage);
    		if ("devModePort" in $$props) $$invalidate(15, devModePort = $$props.devModePort);
    		if ("devMode" in $$props) $$invalidate(14, devMode = $$props.devMode);
    		if ("cmsMode" in $$props) $$invalidate(16, cmsMode = $$props.cmsMode);
    		if ("syntax" in $$props) $$invalidate(3, syntax = $$props.syntax);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Navbar,
    		Jumbotron,
    		Sections,
    		News,
    		Subpage,
    		SubpageMd,
    		Footer,
    		languages,
    		language,
    		defaultLanguage,
    		devModePort,
    		devMode,
    		cmsMode,
    		syntax,
    		navbar,
    		news,
    		subpage,
    		footer,
    		sections,
    		path,
    		homePath,
    		pageType,
    		folderName,
    		queryLanguage,
    		index,
    		prefix,
    		tmpLang,
    		getFolderName,
    		getRoot,
    		handleSetLanguage
    	});

    	$$self.$inject_state = $$props => {
    		if ("languages" in $$props) $$invalidate(1, languages = $$props.languages);
    		if ("language" in $$props) $$invalidate(0, language = $$props.language);
    		if ("defaultLanguage" in $$props) $$invalidate(2, defaultLanguage = $$props.defaultLanguage);
    		if ("devModePort" in $$props) $$invalidate(15, devModePort = $$props.devModePort);
    		if ("devMode" in $$props) $$invalidate(14, devMode = $$props.devMode);
    		if ("cmsMode" in $$props) $$invalidate(16, cmsMode = $$props.cmsMode);
    		if ("syntax" in $$props) $$invalidate(3, syntax = $$props.syntax);
    		if ("navbar" in $$props) $$invalidate(4, navbar = $$props.navbar);
    		if ("news" in $$props) $$invalidate(5, news = $$props.news);
    		if ("subpage" in $$props) $$invalidate(6, subpage = $$props.subpage);
    		if ("footer" in $$props) $$invalidate(7, footer = $$props.footer);
    		if ("sections" in $$props) $$invalidate(8, sections = $$props.sections);
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("homePath" in $$props) $$invalidate(10, homePath = $$props.homePath);
    		if ("pageType" in $$props) $$invalidate(11, pageType = $$props.pageType);
    		if ("folderName" in $$props) $$invalidate(12, folderName = $$props.folderName);
    		if ("queryLanguage" in $$props) queryLanguage = $$props.queryLanguage;
    		if ("index" in $$props) index = $$props.index;
    		if ("prefix" in $$props) prefix = $$props.prefix;
    		if ("tmpLang" in $$props) tmpLang = $$props.tmpLang;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		language,
    		languages,
    		defaultLanguage,
    		syntax,
    		navbar,
    		news,
    		subpage,
    		footer,
    		sections,
    		path,
    		homePath,
    		pageType,
    		folderName,
    		handleSetLanguage,
    		devMode,
    		devModePort,
    		cmsMode,
    		queryLanguage,
    		prefix,
    		index,
    		tmpLang,
    		navbar_1_binding,
    		sections_1_binding,
    		news_1_binding,
    		subpage_1_binding,
    		subpagemd_binding,
    		footer_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			languages: 1,
    			language: 0,
    			defaultLanguage: 2,
    			devModePort: 15,
    			devMode: 14,
    			cmsMode: 16,
    			syntax: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*language*/ ctx[0] === undefined && !("language" in props)) {
    			console_1$1.warn("<App> was created without expected prop 'language'");
    		}

    		if (/*defaultLanguage*/ ctx[2] === undefined && !("defaultLanguage" in props)) {
    			console_1$1.warn("<App> was created without expected prop 'defaultLanguage'");
    		}

    		if (/*devModePort*/ ctx[15] === undefined && !("devModePort" in props)) {
    			console_1$1.warn("<App> was created without expected prop 'devModePort'");
    		}

    		if (/*cmsMode*/ ctx[16] === undefined && !("cmsMode" in props)) {
    			console_1$1.warn("<App> was created without expected prop 'cmsMode'");
    		}

    		if (/*syntax*/ ctx[3] === undefined && !("syntax" in props)) {
    			console_1$1.warn("<App> was created without expected prop 'syntax'");
    		}
    	}

    	get languages() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set languages(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    	get syntax() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set syntax(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let app = new App({
        target: document.body,
        props: {
            devModePort: '5000',
            defaultLanguage: 'pl',
            languages:['pl','en'],
            language: 'pl',
            syntax: 'html',
            cmsMode: false
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
