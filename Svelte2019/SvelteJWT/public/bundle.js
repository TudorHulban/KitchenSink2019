
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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
        document.dispatchEvent(custom_event(type, detail));
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
    }

    const UrlParser = (urlString, namedUrl = "") => {
      const urlBase = new URL(urlString);

      /**
       * Wrapper for URL.host
       *
       **/
      function host() {
        return urlBase.host;
      }

      /**
       * Wrapper for URL.hostname
       *
       **/
      function hostname() {
        return urlBase.hostname;
      }

      /**
       * Returns an object with all the named params and their values
       *
       **/
      function namedParams() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values[paramKey.value] = allPathName[paramKey.index];
          return values;
        }, {});
      }

      /**
       * Returns an array with all the named param keys
       *
       **/
      function namedParamsKeys() {
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(paramKey.value);
          return values;
        }, []);
      }

      /**
       * Returns an array with all the named param values
       *
       **/
      function namedParamsValues() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(allPathName[paramKey.index]);
          return values;
        }, []);
      }

      /**
       * Returns an array with all named param ids and their position in the path
       * Private
       **/
      function namedParamsWithIndex() {
        const namedUrlParams = getPathNames(namedUrl);

        return namedUrlParams.reduce((validParams, param, index) => {
          if (param[0] === ":") {
            validParams.push({ value: param.slice(1), index });
          }
          return validParams;
        }, []);
      }

      /**
       * Wrapper for URL.port
       *
       **/
      function port() {
        return urlBase.port;
      }

      /**
       * Wrapper for URL.pathname
       *
       **/
      function pathname() {
        return urlBase.pathname;
      }

      /**
       * Wrapper for URL.protocol
       *
       **/
      function protocol() {
        return urlBase.protocol;
      }

      /**
       * Wrapper for URL.search
       *
       **/
      function search() {
        return urlBase.search;
      }

      /**
       * Returns an object with all query params and their values
       *
       **/
      function queryParams() {
        const params = {};
        urlBase.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return params;
      }

      /**
       * Returns an array with all the query param keys
       *
       **/
      function queryParamsKeys() {
        const params = [];
        urlBase.searchParams.forEach((_value, key) => {
          params.push(key);
        });

        return params;
      }

      /**
       * Returns an array with all the query param values
       *
       **/
      function queryParamsValues() {
        const params = [];
        urlBase.searchParams.forEach(value => {
          params.push(value);
        });

        return params;
      }

      /**
       * Returns an array with all the elements of a pathname
       *
       **/
      function pathNames() {
        return getPathNames(urlBase.pathname);
      }

      /**
       * Returns an array with all the parts of a pathname
       * Private method
       **/
      function getPathNames(pathName) {
        if (pathName === "/" || pathName.trim().length === 0) return [pathName];
        if (pathName.slice(-1) === "/") {
          pathName = pathName.slice(0, -1);
        }
        if (pathName[0] === "/") {
          pathName = pathName.slice(1);
        }

        return pathName.split("/");
      }

      return Object.freeze({
        host: host(),
        hostname: hostname(),
        namedParams: namedParams(),
        namedParamsKeys: namedParamsKeys(),
        namedParamsValues: namedParamsValues(),
        pathNames: pathNames(),
        port: port(),
        pathname: pathname(),
        protocol: protocol(),
        search: search(),
        queryParams: queryParams(),
        queryParamsKeys: queryParamsKeys(),
        queryParamsValues: queryParamsValues()
      });
    };

    var url_parser = { UrlParser };

    const UrlParser$1 = url_parser.UrlParser;

    var urlParamsParser = {
      UrlParser: UrlParser$1
    };

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var store = /*#__PURE__*/Object.freeze({
        __proto__: null,
        derived: derived,
        readable: readable,
        writable: writable,
        get: get_store_value
    });

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var require$$0 = getCjsExportFromNamespace(store);

    const writable$1 = require$$0.writable;

    const router = writable$1({});

    function set(route) {
      router.set(route);
    }

    function remove() {
      router.set({});
    }

    const activeRoute = {
      subscribe: router.subscribe,
      set,
      remove
    };

    var store$1 = { activeRoute };
    var store_1 = store$1.activeRoute;

    /**
     * Returns true if object has any nested routes empty
     * @param routeObject
     **/
    function anyEmptyNestedRoutes(routeObject) {
      let result = false;
      if (Object.keys(routeObject).length === 0) {
        return true
      }

      if (routeObject.childRoute && Object.keys(routeObject.childRoute).length === 0) {
        result = true;
      } else if (routeObject.childRoute) {
        result = anyEmptyNestedRoutes(routeObject.childRoute);
      }

      return result
    }

    /**
     * Updates the base route path when route.name has a nested inside like /admin/teams
     * @param basePath string
     * @param pathNames array
     * @param route object
     **/
    function compareRoutes(basePath, pathNames, route) {
      if (basePath === '/' || basePath.trim().length === 0) return basePath
      let basePathResult = basePath;
      let routeName = route.name;
      if (routeName[0] === '/') {
        routeName = routeName.slice(1);
      }
      if (basePathResult[0] === '/') {
        basePathResult = basePathResult.slice(1);
      }

      if (!route.childRoute) {
        let routeNames = routeName.split(':')[0];
        if (routeNames.slice(-1) === '/') {
          routeNames = routeNames.slice(0, -1);
        }
        routeNames = routeNames.split('/');
        routeNames.shift();
        routeNames.forEach(() => {
          const currentPathName = pathNames[0];
          if (currentPathName && route.name.includes(`${basePathResult}/${currentPathName}`)) {
            basePathResult += `/${pathNames.shift()}`;
          } else {
            return basePathResult
          }
        });
        return basePathResult
      } else {
        return basePath
      }
    }

    /**
     * Return all the consecutive named param (placeholders) of a pathname
     * @param pathname
     **/
    function getNamedParams(pathName = '') {
      if (pathName.trim().length === '') return []

      const namedUrlParams = getPathNames(pathName);
      return namedUrlParams.reduce((validParams, param, index) => {
        if (param[0] === ':') {
          validParams.push(param.slice(1));
        }
        return validParams
      }, [])
    }

    /**
     * Split a pathname based on /
     * @param pathName
     * Private method
     **/
    function getPathNames(pathName) {
      if (pathName === '/' || pathName.trim().length === 0) return [pathName]
      if (pathName.slice(-1) === '/') {
        pathName = pathName.slice(0, -1);
      }
      if (pathName[0] === '/') {
        pathName = pathName.slice(1);
      }

      return pathName.split('/')
    }

    /**
     * Return the first part of a pathname until the first named param
     * @param name
     **/
    function nameToPath(name = '') {
      let routeName;
      if (name === '/' || name.trim().length === 0) return name
      if (name[0] === '/') {
        name = name.slice(1);
      }

      routeName = name.split(':')[0];
      if (routeName.slice(-1) === '/') {
        routeName = routeName.slice(0, -1);
      }

      return routeName.toLowerCase()
    }

    /**
     * Return the path name including query params
     * @param name
     **/
    function pathWithSearch(currentRoute) {
      let queryParams = [];
      if (currentRoute.queryParams) {
        for (let [key, value] of Object.entries(currentRoute.queryParams)) {
          queryParams.push(`${key}=${value}`);
        }
      }
      if (queryParams.length > 0) {
        return `${currentRoute.path}?${queryParams.join('&')}`
      } else {
        return currentRoute.path
      }
    }

    var utils = {
      anyEmptyNestedRoutes,
      compareRoutes,
      getNamedParams,
      getPathNames,
      nameToPath,
      pathWithSearch
    };

    const { UrlParser: UrlParser$2 } = urlParamsParser;
    const { activeRoute: activeRoute$1 } = store$1;
    const { anyEmptyNestedRoutes: anyEmptyNestedRoutes$1, compareRoutes: compareRoutes$1, getNamedParams: getNamedParams$1, nameToPath: nameToPath$1, pathWithSearch: pathWithSearch$1 } = utils;

    const NotFoundPage = '/404.html';
    let userDefinedRoutes = [];
    let routerOptions = {};
    let currentActiveRoute = '';

    /**
     * Object exposes one single property: activeRoute
     * @param routes  Array of routes
     * @param currentUrl current url
     * @param options configuration options
     **/
    function SpaRouter(routes, currentUrl, options = {}) {
      let redirectTo = '';
      routerOptions = options;
      if (typeof currentUrl === 'undefined' || currentUrl === '') {
        currentUrl = document.location.href;
      }

      if (currentUrl.trim().length > 1 && currentUrl.slice(-1) === '/') {
        currentUrl = currentUrl.slice(0, -1);
      }

      const urlParser = UrlParser$2(currentUrl);
      let routeNamedParams = {};
      userDefinedRoutes = routes;

      function findActiveRoute() {
        redirectTo = '';
        let searchActiveRoute = searchActiveRoutes(routes, '', urlParser.pathNames);

        if (!searchActiveRoute || anyEmptyNestedRoutes$1(searchActiveRoute)) {
          if (typeof window !== 'undefined') {
            forceRedirect(NotFoundPage);
          } else {
            searchActiveRoute = { name: '404', component: '', path: '404' };
          }
        } else {
          searchActiveRoute.path = urlParser.pathname;
        }

        return searchActiveRoute
      }

      /**
       * Redirect current route to another
       * @param destinationUrl
       **/
      function forceRedirect(destinationUrl) {
        if (typeof window !== 'undefined') {
          currentActiveRoute = destinationUrl;
          if (destinationUrl === NotFoundPage) {
            window.location = destinationUrl;
          } else {
            navigateTo(destinationUrl);
          }
        }

        return destinationUrl
      }

      function gaTracking(newPage) {
        if (typeof ga !== 'undefined') {
          ga('set', 'page', newPage);
          ga('send', 'pageview');
        }
      }

      function generate() {
        const currentRoute = findActiveRoute();

        if (currentRoute.redirectTo) {
          return forceRedirect(redirectTo)
        }
        currentActiveRoute = currentRoute.path;
        activeRoute$1.set(currentRoute);

        pushActiveRoute(currentRoute);

        return currentRoute
      }

      /**
       * Updates the browser pathname and history with the active route.
       * @param currentRoute
       **/
      function pushActiveRoute(currentRoute) {
        if (typeof window !== 'undefined') {
          const pathAndSearch = pathWithSearch$1(currentRoute);
          window.history.pushState({ page: pathAndSearch }, '', pathAndSearch);
          if (routerOptions.gaPageviews) {
            gaTracking(pathAndSearch);
          }
        }
      }

      /**
       * Gets an array of routes and the browser pathname and return the active route
       * @param routes
       * @param basePath
       * @param pathNames
       **/
      function searchActiveRoutes(routes, basePath, pathNames) {
        let currentRoute = {};
        let basePathName = pathNames.shift().toLowerCase();

        routes.forEach(function(route) {
          basePathName = compareRoutes$1(basePathName, pathNames, route);

          if (basePathName === nameToPath$1(route.name)) {
            let namedPath = `${basePath}/${route.name}`;
            let routePath = `${basePath}/${nameToPath$1(route.name)}`;
            if (routePath === '//') {
              routePath = '/';
            }

            if (route.redirectTo && route.redirectTo.length > 0) {
              redirectTo = route.redirectTo;
            }

            if (route.onlyIf && route.onlyIf.guard) {
              if (!route.onlyIf.guard()) {
                let destinationUrl = '/';
                if (route.onlyIf.redirect && route.onlyIf.redirect.length > 0) {
                  destinationUrl = route.onlyIf.redirect;
                }
                redirectTo = destinationUrl;
              }
            }

            const namedParams = getNamedParams$1(route.name);
            if (namedParams && namedParams.length > 0) {
              namedParams.forEach(function() {
                if (pathNames.length > 0) {
                  routePath += `/${pathNames.shift()}`;
                }
              });
            }

            if (currentRoute.name !== routePath) {
              const parsedParams = UrlParser$2(`https://fake.com${urlParser.pathname}`, namedPath).namedParams;
              routeNamedParams = { ...routeNamedParams, ...parsedParams };
              currentRoute = {
                name: routePath,
                component: route.component,
                layout: route.layout,
                queryParams: urlParser.queryParams,
                namedParams: routeNamedParams
              };
            }

            if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length > 0) {
              currentRoute.childRoute = searchActiveRoutes(route.nestedRoutes, routePath, pathNames);
            } else if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0) {
              const indexRoute = searchActiveRoutes(route.nestedRoutes, routePath, ['index']);
              if (indexRoute && Object.keys(indexRoute).length > 0) {
                currentRoute.childRoute = indexRoute;
              }
            }
          }
        });

        if (redirectTo) {
          currentRoute['redirectTo'] = redirectTo;
        }

        return currentRoute
      }

      return Object.freeze({
        activeRoute: generate()
      })
    }

    /**
     * Updates the current active route and updates the browser pathname
     * @param pathName
     **/
    function navigateTo(pathName) {
      if (pathName.trim().length > 1 && pathName[0] === '/') {
        pathName = pathName.slice(1);
      }

      const activeRoute = SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).activeRoute;

      return activeRoute
    }

    /**
     * Returns true if pathName is current active route
     * @param pathName
     **/
    function routeIsActive(queryPath, includePath = false) {
      if (queryPath[0] !== '/') {
        queryPath = '/' + queryPath;
      }

      let pathName = UrlParser$2(`http://fake.com${queryPath}`).pathname;
      if (pathName.slice(-1) === '/') {
        pathName = pathName.slice(0, -1);
      }

      let activeRoute = currentActiveRoute || pathName;
      if (activeRoute.slice(-1) === '/') {
        activeRoute = activeRoute.slice(0, -1);
      }

      if (includePath) {
        return activeRoute.includes(pathName)
      } else {
        return activeRoute === pathName
      }
    }

    if (typeof window !== 'undefined') {
      // Avoid full page reload on local routes
      window.addEventListener('click', event => {
        if (event.target.pathname && event.target.hostname === window.location.hostname && event.target.localName === 'a') {
          event.preventDefault();
          // event.stopPropagation()
          navigateTo(event.target.pathname + event.target.search);
        }
      });

      window.onpopstate = function(_event) {
        navigateTo(window.location.pathname + window.location.search);
      };
    }

    var router$1 = { SpaRouter, navigateTo, routeIsActive };
    var router_1 = router$1.SpaRouter;
    var router_2 = router$1.navigateTo;
    var router_3 = router$1.routeIsActive;

    /* node_modules/svelte-router-spa/src/components/route.svelte generated by Svelte v3.12.1 */

    // (10:34) 
    function create_if_block_2(ctx) {
    	var current;

    	var route = new Route({
    		props: {
    		currentRoute: ctx.currentRoute.childRoute,
    		params: ctx.params
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			route.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route_changes = {};
    			if (changed.currentRoute) route_changes.currentRoute = ctx.currentRoute.childRoute;
    			if (changed.params) route_changes.params = ctx.params;
    			route.$set(route_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(10:34) ", ctx });
    	return block;
    }

    // (8:33) 
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = ctx.currentRoute.component;

    	function switch_props(ctx) {
    		return {
    			props: {
    			currentRoute: { ...ctx.currentRoute, component: '' },
    			params: ctx.params
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.currentRoute) switch_instance_changes.currentRoute = { ...ctx.currentRoute, component: '' };
    			if (changed.params) switch_instance_changes.params = ctx.params;

    			if (switch_value !== (switch_value = ctx.currentRoute.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(8:33) ", ctx });
    	return block;
    }

    // (6:0) {#if currentRoute.layout}
    function create_if_block(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = ctx.currentRoute.layout;

    	function switch_props(ctx) {
    		return {
    			props: {
    			currentRoute: { ...ctx.currentRoute, layout: '' },
    			params: ctx.params
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.currentRoute) switch_instance_changes.currentRoute = { ...ctx.currentRoute, layout: '' };
    			if (changed.params) switch_instance_changes.params = ctx.params;

    			if (switch_value !== (switch_value = ctx.currentRoute.layout)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(6:0) {#if currentRoute.layout}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.currentRoute.layout) return 0;
    		if (ctx.currentRoute.component) return 1;
    		if (ctx.currentRoute.childRoute) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
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
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { currentRoute = {}, params = {} } = $$props;

    	const writable_props = ['currentRoute', 'params'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('currentRoute' in $$props) $$invalidate('currentRoute', currentRoute = $$props.currentRoute);
    		if ('params' in $$props) $$invalidate('params', params = $$props.params);
    	};

    	$$self.$capture_state = () => {
    		return { currentRoute, params };
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentRoute' in $$props) $$invalidate('currentRoute', currentRoute = $$props.currentRoute);
    		if ('params' in $$props) $$invalidate('params', params = $$props.params);
    	};

    	return { currentRoute, params };
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["currentRoute", "params"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Route", options, id: create_fragment.name });
    	}

    	get currentRoute() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get params() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var route = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Route
    });

    /* node_modules/svelte-router-spa/src/components/router.svelte generated by Svelte v3.12.1 */

    function create_fragment$1(ctx) {
    	var current;

    	var route = new Route({
    		props: { currentRoute: ctx.$activeRoute },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			route.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route_changes = {};
    			if (changed.$activeRoute) route_changes.currentRoute = ctx.$activeRoute;
    			route.$set(route_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;

    	validate_store(store_1, 'activeRoute');
    	component_subscribe($$self, store_1, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });

    	

      let { routes = [], options = {} } = $$props;

      onMount(function() {
        router_1(routes, document.location.href, options).activeRoute;
      });

    	const writable_props = ['routes', 'options'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('routes' in $$props) $$invalidate('routes', routes = $$props.routes);
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    	};

    	$$self.$capture_state = () => {
    		return { routes, options, $activeRoute };
    	};

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate('routes', routes = $$props.routes);
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    		if ('$activeRoute' in $$props) store_1.set($activeRoute);
    	};

    	return { routes, options, $activeRoute };
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["routes", "options"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Router", options, id: create_fragment$1.name });
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var router$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Router
    });

    /* node_modules/svelte-router-spa/src/components/navigate.svelte generated by Svelte v3.12.1 */

    const file = "node_modules/svelte-router-spa/src/components/navigate.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			attr_dev(a, "href", ctx.to);
    			attr_dev(a, "title", ctx.title);
    			attr_dev(a, "class", ctx.styles);
    			toggle_class(a, "active", router_3(ctx.to));
    			add_location(a, file, 13, 0, 255);
    			dispose = listen_dev(a, "click", ctx.navigate);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if (!current || changed.to) {
    				attr_dev(a, "href", ctx.to);
    			}

    			if (!current || changed.title) {
    				attr_dev(a, "title", ctx.title);
    			}

    			if (!current || changed.styles) {
    				attr_dev(a, "class", ctx.styles);
    			}

    			if ((changed.styles || changed.routeIsActive || changed.to)) {
    				toggle_class(a, "active", router_3(ctx.to));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { to = '/', title = '', styles = '' } = $$props;

      function navigate(event) {
        event.preventDefault();
        event.stopPropagation();
        router_2(to);
      }

    	const writable_props = ['to', 'title', 'styles'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Navigate> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('styles' in $$props) $$invalidate('styles', styles = $$props.styles);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { to, title, styles };
    	};

    	$$self.$inject_state = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('styles' in $$props) $$invalidate('styles', styles = $$props.styles);
    	};

    	return {
    		to,
    		title,
    		styles,
    		navigate,
    		$$slots,
    		$$scope
    	};
    }

    class Navigate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "title", "styles"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Navigate", options, id: create_fragment$2.name });
    	}

    	get to() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var navigate = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Navigate
    });

    var Route$1 = getCjsExportFromNamespace(route);

    var Router$1 = getCjsExportFromNamespace(router$2);

    var Navigate$1 = getCjsExportFromNamespace(navigate);

    const SpaRouter$1 = router$1.SpaRouter;
    const navigateTo$1 = router$1.navigateTo;
    const routeIsActive$1 = router$1.routeIsActive;




    var src = {
      SpaRouter: SpaRouter$1,
      navigateTo: navigateTo$1,
      routeIsActive: routeIsActive$1,
      Route: Route$1,
      Router: Router$1,
      Navigate: Navigate$1
    };
    var src_5 = src.Router;

    /* src/views/landing.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/views/landing.svelte";

    function create_fragment$3(ctx) {
    	var h5;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Landing Page";
    			add_location(h5, file$1, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h5);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Landing", options, id: create_fragment$3.name });
    	}
    }

    const req = async (pURL, pFormData, pMethod = 'POST') => {
      const resp = await fetch(pURL, {
        method: pMethod,
        headers: {
          Accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: pFormData
      });
      return resp.json();
    };

    /* src/views/login.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/views/login.svelte";

    function create_fragment$4(ctx) {
    	var h5, t1, form, label0, t3, input0, t4, label1, t6, input1, t7, button, dispose;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Login Page";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "User CODE";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Login";
    			add_location(h5, file$2, 17, 0, 393);
    			add_location(label0, file$2, 20, 2, 463);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "logincode");
    			add_location(input0, file$2, 21, 2, 490);
    			add_location(label1, file$2, 23, 2, 554);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "name", "password");
    			add_location(input1, file$2, 24, 2, 580);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$2, 26, 2, 647);
    			add_location(form, file$2, 19, 0, 414);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(form, "submit", prevent_default(ctx.handleSubmit), false, true)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);

    			set_input_value(input0, ctx.usercode);

    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);

    			set_input_value(input1, ctx.password);

    			append_dev(form, t7);
    			append_dev(form, button);
    		},

    		p: function update(changed, ctx) {
    			if (changed.usercode && (input0.value !== ctx.usercode)) set_input_value(input0, ctx.usercode);
    			if (changed.password && (input1.value !== ctx.password)) set_input_value(input1, ctx.password);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h5);
    				detach_dev(t1);
    				detach_dev(form);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let usercode = "tudi";
      let password = "xxx";

      function handleSubmit(event) {
        const bodyFormData = new FormData();
        bodyFormData.set("logincode", usercode);
        bodyFormData.set("password", password);

        req("http://localhost:1323/login", bodyFormData).then(r =>
          console.log("token:", r.token)
        );
      }

    	function input0_input_handler() {
    		usercode = this.value;
    		$$invalidate('usercode', usercode);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate('password', password);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('usercode' in $$props) $$invalidate('usercode', usercode = $$props.usercode);
    		if ('password' in $$props) $$invalidate('password', password = $$props.password);
    	};

    	return {
    		usercode,
    		password,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Login", options, id: create_fragment$4.name });
    	}
    }

    /* src/views/authorized.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/views/authorized.svelte";

    function create_fragment$5(ctx) {
    	var h5;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Restricted Page";
    			add_location(h5, file$3, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h5);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    class Authorized extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Authorized", options, id: create_fragment$5.name });
    	}
    }

    function userIsAdmin() {
      return false;
    }

    const routes = [
      {
        name: '/',
        component: Landing
      },
      {
        name: 'login',
        component: Login
      },
      {
        name: 'admin',
        component: Authorized,
        onlyIf: {
          guard: userIsAdmin,
          redirect: '/login'
        }
      }
    ];

    /* src/App.svelte generated by Svelte v3.12.1 */

    function create_fragment$6(ctx) {
    	var current;

    	var router = new src_5({
    		props: { routes: routes },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$6.name });
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
