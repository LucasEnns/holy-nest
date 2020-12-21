
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
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
        if (text.wholeText === data)
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

    /////////////////TO DO//////////////////////////////////
    // interface to upload csv and return finished output
    // return info about nest efficiency
    // basic cnc setup, gCode creator

    /////////////////IDEAS//////////////////////////////////
    // simple gui to accept or reject nested sheets
    // potentially flag sheets with low score
    // click sheet shuffle columns


    // new technique-- class panel widths by +- %
    // if none next is +- 1/2 of width

    // idea 2
    // start width columns of all the similar widths
    // that join columns


    // import { toDECIMAL } from "./methods"

    let CUTTER = 0.375;         // end mill diameter used to space panels
    let GAP = 0;                // gap + bit size = total space
    let ERRORS = [];            // catch all panels that don't fit
    let MATERIAL = {           // sheet size and options
            width: 49,
            height: 97,
            margins: 0.25,
            max_width: () => MATERIAL.width - MATERIAL.margins * 2 - CUTTER,
            max_height: () => MATERIAL.height - MATERIAL.margins * 2 - CUTTER
        };

    function Nest( panels,
            firstPanelRow = 1,
            metricUnits = false,
            cutter = CUTTER,
            gap = GAP,
            material = MATERIAL
    ) {

        function panelArrayCreator() {
            // console.log(CSVToArray( panels ));
            return new List( panels
                    .slice( firstPanelRow )
                    .flatMap( i => {
                        return quantityIDs( i ).map( i => new Panel( i )
                        )
                    } )
                ).flat()
        }

        function quantityIDs( [ id, quantity, width, height ] ) {
            if ( width > MATERIAL.max_width() ||
                height > MATERIAL.max_height() ) {
                    ERRORS.push(`Panneau ${id} est trop gros`);
                    // ERRORS.push(`Panel ${id} is too big`)
                    return []
            } else if ( !width || !height || !quantity ) return []
            let n = 1, uniqueIDs = [];
            while ( quantity >= n ) {
                let q = "";
                if ( quantity > 1 ) q = `${n} sur ${quantity}`;
                // if ( quantity > 1 ) q = `${n} of ${quantity}`
                uniqueIDs.push( [ q , id, parseFloat(width), parseFloat(height) ] );
                n++;
            }
            return uniqueIDs
        }


        ERRORS = [];
        const PANELS = panelArrayCreator();          // raw csv panel input converted
        // const METRIC_UNITS = metricUnits  // default false
        // const TARGET_FIT = 0.8                      // ratio of a good fit per sheet
        CUTTER = cutter;
        GAP = gap;
        MATERIAL.width = material.width;
        MATERIAL.height = material.height;
        MATERIAL.margins = material.margins;


        function fillColumn( panels ) {
            let column = new List( panels.widest().place() );
            let maxWidth = column[0].width;
            // add rows of panels to column until
            // no space remains or no more panels
            while ( panels.fitsColumn( column ) ) {
                let row = new List(
                    panels.fitsColumn( column ).place()
                );
                // add more panels to row if space remains
                while ( panels.fitsRow( row, maxWidth ) ) {
                    row.push( panels.fitsRow( row, maxWidth ).place() );
                }
                // return nested array only if
                // more than one panel in row
                if ( row.length === 1 ) column.push( row[0] );
                else column.push( row );
            }
            // smallest pieces to center of column
            // return column.shuffle()
            return column.ascendingWidth()
        }


        function makeColumns ( panels ) {
            let columns = new List();
            while ( panels.notPlaced().length > 0 ) {
                let column = fillColumn( panels );
                columns.push( new Column (
                    column.columnWidth(),       //width
                    column.columnHeight(),      // height
                    column.columnArea(),        // area
                    column                      // group
                ));
            }
            return columns
        }

        function fillSheet( columns ) {
            let sheet = new List( columns.widest().place() );
            while ( columns.fitsSheet( sheet ) ) {
                sheet.push( columns.fitsSheet( sheet ).place() );
            }
            // smallest pieces to center of sheet
            // return sheet.shuffle()
            return sheet
        }

        function makeSheets( panels ) {
            let columns = makeColumns( panels );
            let sheets =  new List();
            while ( columns.notPlaced().length > 0 ) {
                let sheet = fillSheet( columns );
                addCoordinates( sheet);
                sheets.push( new Sheet(
                    sheet.filledWidth(),                        // width
                    sheet.filledHeight(),                       // height
                    sheet.filledArea(),                         // area
                    sheet.map(list => list.group).flatten(2),   // group
                    sheet,                                      // columns
                    sheets.length + 1                           // id
                ));
            }
            return sheets
        }

        function addCoordinates( columns, multiplier ) {
            // let startX = MATERIAL.margins + MATERIAL.width * multiplier
            let startX = MATERIAL.margins;
            let startY = MATERIAL.margins;
            // start X and Y for svg output with multiple sheets

            let xPos = new List();

            columns.forEach( ( column, i ) => {
                // xPos map of columns, first index === start
                if ( i === 0 ) { xPos.push( startX ); }
                // everything after calculated += prev. width
                else { xPos.push(xPos.last() + columns[i - 1].width); }

                let yPos = new List();

                // iterate each row in column
                column.group.forEach( ( row, j, rows ) => {
                    // yPos map of rows, first index === start
                    if ( j === 0 ) { yPos.push( startY ); }
                    // everything after calculated += prev. height
                    // with appropriate method for row type
                    else if ( rows[j - 1] instanceof List ) {
                        yPos.push(yPos.last() + rows[j - 1].filledHeight());
                    }
                    else { yPos.push(yPos.last() + rows[j - 1].height); }

                    // add x0 and y0 prop to each row in column
                    if ( row instanceof Panel ) {
                        row.x0 = xPos[i];
                        row.y0 = yPos[j];
                    }
                    else {
                        row.forEach(( rowCol, k ) => {
                            if ( k === 0 ) { rowCol.x0 = xPos[i]; }
                            else { rowCol.x0 = row[k-1].x0 + row[k-1].width; }
                            rowCol.y0 = yPos[j];
                        });
                    }
                });
            });
        }
        let sheets = makeSheets( PANELS );
        return [ PANELS, sheets, ERRORS ]
    }




    class Placement {
        constructor() {
            this.placed = false;
        }
        place() {
            this.placed = true;
            return this
        }
    }

    class Panel extends Placement {
        constructor( [ uniqueID, id, width, height ] ) {
            super();
            this.uniqueID = uniqueID;
            this.id = id;
            this.width = width + CUTTER + GAP;
            this.height = height + CUTTER + GAP;
            this.area = this.height * this.width;
            this.x0 = 0;
            this.y0 = 0;
        }
    }

    class Column extends Placement {
       constructor( width, height, area, group ){
            super();
            this.width = width;
            this.height = height;
            this.area = area;
            this.group = group;
        }
    }

    class Sheet extends Column {
       constructor( width, height, area, group, columns, id ){
            super( width, height, area, group  );
            this.columns = columns;
            this.sheet_width = MATERIAL.width;
            this.sheet_height = MATERIAL.height;
            this.sheet_area = MATERIAL.width * MATERIAL.height;
            this.waste_area = this.sheet_area - this.area;
            this.waste_ratio = 1 - this.area / this.sheet_area;
            this.id = "Feuille " + id;
            // this.id = "Sheet " + id
            delete this.placed;
        }
    }

    class List extends Array {
    //  methods for arrays of Panel or group objects
        // extending array methods
        first() {
            return this[0]
        }
        last() {
            return this[this.length-1]
        }
        flatten( dimensions = 1 ) {
            let flattened = this;
            while ( dimensions-- ) {
                flattened = flattened.flat();
                // dimensions--
            }
            return flattened
        }
        // removeIndex( index ) {
        //     let list = [...this]
        //     this = [...list.slice(0, index), ...list.slice(index + 1)]
        // }
        // removeValue( value ) {
        //     this.removeIndex( array.indexOf( value ) )
        // }
        shuffle() {
            if ( this.length < 3 ) return this
            return new List( ...this.slice(1), this.first() )
        }
        // sorting methods
        ascendingWidth() {
            return new List( ...this )
                .sort(( a, b ) => b.width != a.width ?
                    b.width - a.width :
                    b.height - a.height)
        }
        ascendingHeight() {
            return new List( ...this )
                .sort(( a, b ) => b.height != a.height ?
                    b.height - a.height :
                    b.width - a.width)
        }
        // methods to find unplaced panels
        notPlaced() {
            return this.filter(panel => !panel.placed)
        }
        widest() {
            return this.notPlaced().ascendingWidth().first()
        }
        narrowest() {
            return this.notPlaced().ascendingWidth().last()
        }
        tallest() {
            return this.notPlaced().ascendingHeight().first()
        }
        shortest() {
            return this.notPlaced().ascendingHeight().last()
        }
        biggest() {
            return this
                .sort(( a, b ) => b.area - a.area )
                .notPlaced()
                .first()
        }
        // group measurement methods
        totalWidth() {
            return this.reduce(( total, panel ) => {
                if ( panel instanceof List ) {
                    return total + panel.ascendingWidth().first().width
                }
                return total + panel.width
            }, 0)
        }
        totalHeight() {
            return this.reduce( ( total, panel ) => {
                if ( panel instanceof List ) {
                    return total + panel.ascendingHeight().first().height
                }
                return total + panel.height
            }, 0 )
        }
        totalArea() {
            return this.reduce((total, panel) => total + panel.area, 0)
        }
        columnWidth() {
            return this.flat().ascendingWidth().first().width
        }
        columnHeight() {
            return this.totalHeight()
        }
        columnArea() {
            return this.flat().totalArea()
        }
        filledHeight() {
            return this.ascendingHeight().first().height
        }
        filledWidth() {
            return this.totalWidth()
        }
        filledArea() {
            return this.flat().totalArea()
        }
        remainingWidth( maxWidth ) {
            return maxWidth - this.totalWidth()
        }
        remainingHeight( maxHeight ) {
            return maxHeight - this.totalHeight()
        }
        fitsColumn( group, maxHeight = MATERIAL.height ) {
            return this.notPlaced()
                .filter(panel => panel.width <= group[0].width)
                .filter(panel => panel.height < group.remainingHeight( maxHeight ))
                // .biggest()
                .widest()
        }
        fitsRow( group, maxWidth ) {
            return this.notPlaced()
                .filter(panel => panel.height <= group[0].height)
                .filter(panel => panel.width < group.remainingWidth( maxWidth ))
                // .biggest()
                .widest()
        }
        fitsSheet( group, maxWidth = MATERIAL.width ) {
            return this.notPlaced()
                // .filter(panel => panel.height <= group[0].height)
                .filter(panel => panel.width < group.remainingWidth( maxWidth ))
                .widest()
        }
    }

    function toFloat( str ) {
        const float4 = ( str ) => parseFloat( parseFloat(str).toFixed(4) );
        if ( !isNaN( str ) ) return float4( str ) // if number return float
        if ( str.includes("/") && !str.includes(".") ) {
            return str
                .split(" ") // covert rational string into array
                .filter( item => item !== "" ) // removes multiple spaces
                .reduce( ( total, item ) => { // get array total of whole # + fraction
                    if ( item.includes("/") ) {
                        let frac = item.split("/").filter( item => item !== "" );
                        return total + float4( frac[0] / frac[1] )
                    }
                    return total + float4( item )
                }, 0 )
        }
        return str
    }

    function hasNumber( str ) {
        return /\d/.test( str );
    }


    function trunc ( number, places ) {
        return parseInt( number * ( 10 ** places ) ) / ( 10 ** places )
    }


    function formatDate(date, format) {
        const map = {
            mm: date.getMonth() + 1,
            dd: date.getDate(),
            yy: date.getFullYear().toString().slice(-2),
            yyyy: date.getFullYear(),
            H: date.getHours(),
            M: date.getMinutes(),
            S: date.getSeconds(),
        };

        return format.replace(/mm|dd|yy|yyyy|H|M|S/gi, matched => map[matched])
    }

    ///////////////////////////////////////////////////////

    let TOOL_NUMBER = 9;
    let SPINDLE_SPEED = 18000;
    let FEED_RATE = 400;
    let PLUNGE_RATE = 50;
    let X_HOME = 30.0;
    let Y_HOME = 120.0;
    // let Z_HOME = 0
    let SAFE_HEIGHT = 1;
    let CUT_TO_DEPTH = 0;

    function HEADER( tool, speed, fileName, sheets ) {
        return [
            `( ${fileName} )`,
            // `( ${sheets} sheets to cut )`,
            `( ${sheets} feuilles a couper )`,
            `( ${formatDate(new Date(), 'yyyy/mm/dd H:M')} )`,
            `G40 G80 G70`,
            `G91 G28 Z0`,
            `M06 T${tool}`,
            `G43 H${tool}`,
            `S${speed} M03`,
            `G54 G90`
        ]
    }
    function SHEET_CHANGE( x, y ) {
        return [
            `M05 M104`,
            `G90 X${addPoint(x)} Y${addPoint(y)}`,
            `M00`,
            // `( Load next sheet and )`,
            `( changez la feuille et )`,
            `( cycle start :)`,
            `M103 M03`
        ]
    }
    function FOOTER() {
        return [
            `G40 G80 G91 G28 Z0 M5`,
            `G00 G90 X${addPoint(X_HOME)} Y${addPoint(Y_HOME)}`,
            `M30`
        ]
    }
    function RAPID_MOVE( x, y, z ) { return `G00 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)}` }
    function RETRACT_MOVE( z ) { return `G00 Z${addPoint(z)}` }
    function PLUNGE_MOVE( x, y, z, f ) { return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}` }
    function FEED_MOVE( x, y, z, f ) { return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}` }
    function MOVE_X( x ) { return `X${addPoint(x)}` }
    function MOVE_Y( y ) { return `Y${addPoint(y)}` }

    function addPoint ( num ) {
        if ( /\./.test( num ) || num === 0 ) return num
        return num.toFixed(1)
    }

    function Gcode( sheets, material ,fileName ) {
        X_HOME = material.width / 2;
        Y_HOME = material.height + 10; // add limit to 122"
        let output = [
            ...HEADER( TOOL_NUMBER, SPINDLE_SPEED, fileName, sheets.length )
        ];
        sheets.forEach( sheet => {
            output.push(`( ${sheet.id} )`);
            sheet.columns.forEach( (column, index) => {
                column.group.flat().sort(( a, b ) => index % 2 !== 0 ?
                    a.y0 != b.y0 : b.y0 != a.y0 ?
                    b.y0 - a.y0 : b.x0 - a.x0)
                .forEach( panel => output.push( profileCut( panel, material ) ));
            });
            output.push( SHEET_CHANGE( X_HOME, Y_HOME ) );
        });
        output.pop(); // get rid of last sheet change
        output.push( FOOTER() );
        return output.flat().join('\n')
    }

    function profileCut( panel, material ) {
        SAFE_HEIGHT = material.thickness + 0.25;

        const { x0, y0, width, height } = panel;
        let x_ = x0 + width;
        let y_ = y0 + height;
        let yStart = y0 + height / 5;
        let yEnd = yStart + SAFE_HEIGHT;

        return [
            // `( cutting panel ${panel.id} )`,
            `( coupe panneau ${panel.id} )`,
            `( ${panel.uniqueID} )`,
            RAPID_MOVE( x0, yStart, SAFE_HEIGHT ),
            PLUNGE_MOVE( x0, yEnd, CUT_TO_DEPTH, PLUNGE_RATE ),
            FEED_MOVE( x0, y_, CUT_TO_DEPTH, FEED_RATE ),
            MOVE_X( x_ ),
            MOVE_Y( y0 ),
            MOVE_X( x0 ),
            MOVE_Y( yEnd ),
            RETRACT_MOVE( SAFE_HEIGHT ),
            // `( finished panel ${panel.id} )`,
            `( fin panneau ${panel.id} )`
        ]
    }

    const subscriber_queue = [];
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

    // import YAML from 'yaml';

    const localStore = (key, initial) => {
      // receives the key of the local storage and an initial value

      // helper function
      const toString = (value) => JSON.stringify(value, null, 2);
      // helper function
      const toObj = JSON.parse;

      // item not present in local storage
      if (localStorage.getItem(key) === null) {
        // initialize local storage with initial value
        localStorage.setItem(key, toString(initial));
      }

      // convert to object
      const saved = toObj(localStorage.getItem(key));

      // create the underlying writable store
      const { subscribe, set, update } = writable(saved);

      return {
        subscribe,
        set: (value) => {
          // save also to local storage as a string
          localStorage.setItem(key, toString(value));
          return set(value)
        },
        update
      }
    };

    // import YAML from 'yaml';

    const sessionStore = (key, initial) => {
      // receives the key of the local storage and an initial value

      // helper function
      const toString = (value) => JSON.stringify(value, null, 2);
      // helper function
      const toObj = JSON.parse;

      // item not present in local storage
      if (sessionStorage.getItem(key) === null) {
        // initialize local storage with initial value
        sessionStorage.setItem(key, toString(initial));
      }

      // convert to object
      const saved = toObj(sessionStorage.getItem(key));

      // create the underlying writable store
      const { subscribe, set, update } = writable(saved);

      return {
        subscribe,
        set: (value) => {
          // save also to local storage as a string
          sessionStorage.setItem(key, toString(value));
          return set(value)
        },
        update
      }
    };

    // stores.js

    let placementSettings = {

      material: {
        width: 49,
        height: 97,
        thickness: 0.75,
        margins: 0.125
      },
      cutter: 0.375,
      gap: 0,
      units: false
    };
    // const fallback = [
    //   { sheet_width: 49, sheet_height: 97 }
    // ]

    const blancCSV = {
      name: formatDate( new Date(), 'yymmdd-HM' ),
      errors: [],
      contents: [
        ['Project name:', 'New'],
        ['Border (+ or -)', 0],
        ['Metric units', false],
        [,,,],
        ['Panel','Q','W','H'],
        [1,,,]

      ]
    };

    // export const cabinets = localStore('cabinets', [])

    // export const inputState = localStore('input-state', "cabinet")
    // export const cabinetType = localStore('cabinet-type', "bathroom")

    const settings = localStore('settings', placementSettings);
    const panels = sessionStore('panels', []);
    const sheets = sessionStore('sheets', []);
    const csvFile = sessionStore('csv-file', blancCSV);
    const svg = sessionStore('svg', '');
    const activePanel = sessionStore('activePanel', '');

    // export const inputTemplate = localStore('template', template)

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var FileSaver_min = createCommonjsModule(function (module, exports) {
    (function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(a,b,c){var d=new XMLHttpRequest;d.open("GET",a),d.responseType="blob",d.onload=function(){g(d.response,b,c);},d.onerror=function(){console.error("could not download file");},d.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),g=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else {var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(b,d,e,g){if(g=g||open("","_blank"),g&&(g.document.title=g.document.body.innerText="downloading..."),"string"==typeof b)return c(b,d,e);var h="application/octet-stream"===b.type,i=/constructor/i.test(f.HTMLElement)||f.safari,j=/CriOS\/[\d]+/.test(navigator.userAgent);if((j||h&&i||a)&&"undefined"!=typeof FileReader){var k=new FileReader;k.onloadend=function(){var a=k.result;a=j?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),g?g.location.href=a:location=a,g=null;},k.readAsDataURL(b);}else {var l=f.URL||f.webkitURL,m=l.createObjectURL(b);g?g.location=m:location.href=m,g=null,setTimeout(function(){l.revokeObjectURL(m);},4E4);}});f.saveAs=g.saveAs=g,(module.exports=g);});


    });

    function CSVToArray( strData, headerRows = 1, strDelimiter = "," ) {

        // Create a regular expression to parse the CSV values.
        var regexPattern = new RegExp( (
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +  // Delimiters.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +         // Quoted fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"     // Standard fields.
            ), "gi" );

        // Create an array of arrays to hold csv data.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = regexPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if ( strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
                ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );
            }

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if ( arrMatches[ 2 ] ){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[ 2 ].replace(
                        new RegExp( "\"\"", "g" ), "\"" );

            } else {
                // We found a non-quoted value.
                var strMatchedValue = arrMatches[ 3 ];
            }

            if ( hasNumber( strMatchedValue ) ) {
                strMatchedValue = toFloat( strMatchedValue );
            }

            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return arrData.filter( ( item, index ) => {
            // keep all header rows
                if ( index < headerRows ) return true
            // removes blanc rows thereafter
                return item.filter( inner => inner !== "" ).length
            } )
    }

    /* src/components/Import.svelte generated by Svelte v3.24.1 */
    const file_1 = "src/components/Import.svelte";

    // (311:3) {:else}
    function create_else_block(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "file-icon dl-csv-block blocked svelte-1qzoat3");
    			add_location(div0, file_1, 311, 6, 6394);
    			attr_dev(div1, "class", "file-icon dl-svg-block blocked svelte-1qzoat3");
    			add_location(div1, file_1, 312, 6, 6451);
    			attr_dev(div2, "class", "file-icon dl-cnc-block blocked svelte-1qzoat3");
    			add_location(div2, file_1, 313, 6, 6508);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(311:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (301:3) {#if  $sheets.length }
    function create_if_block(ctx) {
    	let a0;
    	let div0;
    	let a0_href_value;
    	let a0_download_value;
    	let t0;
    	let a1;
    	let div1;
    	let a1_href_value;
    	let a1_download_value;
    	let t1;
    	let a2;
    	let div2;
    	let a2_href_value;
    	let a2_download_value;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			div0 = element("div");
    			t0 = space();
    			a1 = element("a");
    			div1 = element("div");
    			t1 = space();
    			a2 = element("a");
    			div2 = element("div");
    			attr_dev(div0, "class", "file-icon dl-csv svelte-1qzoat3");
    			add_location(div0, file_1, 302, 9, 5937);
    			attr_dev(a0, "href", a0_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*csv*/ ctx[7]));
    			attr_dev(a0, "download", a0_download_value = "" + (/*$csvFile*/ ctx[2].name + /*today*/ ctx[8] + ".csv"));
    			attr_dev(a0, "alt", "download csv file");
    			attr_dev(a0, "class", "svelte-1qzoat3");
    			add_location(a0, file_1, 301, 6, 5798);
    			attr_dev(div1, "class", "file-icon dl-svg svelte-1qzoat3");
    			add_location(div1, file_1, 305, 9, 6131);
    			attr_dev(a1, "href", a1_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*$svg*/ ctx[6]));
    			attr_dev(a1, "download", a1_download_value = "" + (/*$csvFile*/ ctx[2].name + /*today*/ ctx[8] + ".svg"));
    			attr_dev(a1, "alt", "download svg file");
    			attr_dev(a1, "class", "svelte-1qzoat3");
    			add_location(a1, file_1, 304, 6, 5991);
    			attr_dev(div2, "class", "file-icon dl-cnc svelte-1qzoat3");
    			add_location(div2, file_1, 308, 9, 6329);
    			attr_dev(a2, "href", a2_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*cnc*/ ctx[3]()));
    			attr_dev(a2, "download", a2_download_value = "" + (/*$csvFile*/ ctx[2].name + /*today*/ ctx[8] + ".cnc"));
    			attr_dev(a2, "alt", "download g-code file");
    			attr_dev(a2, "class", "svelte-1qzoat3");
    			add_location(a2, file_1, 307, 6, 6185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, div0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, div1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a2, anchor);
    			append_dev(a2, div2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$csvFile*/ 4 && a0_download_value !== (a0_download_value = "" + (/*$csvFile*/ ctx[2].name + /*today*/ ctx[8] + ".csv"))) {
    				attr_dev(a0, "download", a0_download_value);
    			}

    			if (dirty & /*$svg*/ 64 && a1_href_value !== (a1_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*$svg*/ ctx[6]))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*$csvFile*/ 4 && a1_download_value !== (a1_download_value = "" + (/*$csvFile*/ ctx[2].name + /*today*/ ctx[8] + ".svg"))) {
    				attr_dev(a1, "download", a1_download_value);
    			}

    			if (dirty & /*cnc*/ 8 && a2_href_value !== (a2_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*cnc*/ ctx[3]()))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (dirty & /*$csvFile*/ 4 && a2_download_value !== (a2_download_value = "" + (/*$csvFile*/ ctx[2].name + /*today*/ ctx[8] + ".cnc"))) {
    				attr_dev(a2, "download", a2_download_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(301:3) {#if  $sheets.length }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let title_value;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let input0;
    	let t2;
    	let label0;
    	let div1;
    	let div1_class_value;
    	let t3;
    	let t4;
    	let div8;
    	let div3;
    	let h50;
    	let t6;
    	let input1;
    	let t7;
    	let span0;
    	let t9;
    	let input2;
    	let t10;
    	let span1;
    	let t12;
    	let input3;
    	let t13;
    	let div4;
    	let h51;
    	let t15;
    	let input4;
    	let t16;
    	let div5;
    	let h52;
    	let t18;
    	let input5;
    	let t19;
    	let div7;
    	let h53;
    	let t21;
    	let label1;
    	let input6;
    	let div6;
    	let mounted;
    	let dispose;
    	document.title = title_value = /*$csvFile*/ ctx[2].name || "Nest";

    	function select_block_type(ctx, dirty) {
    		if (/*$sheets*/ ctx[4].length) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			div1 = element("div");
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			div8 = element("div");
    			div3 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Material W x H x T";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			span0 = element("span");
    			span0.textContent = "x";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			span1 = element("span");
    			span1.textContent = "x";
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			div4 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Margins";
    			t15 = space();
    			input4 = element("input");
    			t16 = space();
    			div5 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Tool Kerf";
    			t18 = space();
    			input5 = element("input");
    			t19 = space();
    			div7 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Units";
    			t21 = space();
    			label1 = element("label");
    			input6 = element("input");
    			div6 = element("div");
    			attr_dev(div0, "class", "file-icon new svelte-1qzoat3");
    			attr_dev(div0, "alt", "new csv file");
    			add_location(div0, file_1, 282, 3, 5344);
    			attr_dev(input0, "class", "inputfile svelte-1qzoat3");
    			attr_dev(input0, "name", "file");
    			attr_dev(input0, "id", "file");
    			attr_dev(input0, "type", "file");
    			add_location(input0, file_1, 287, 3, 5441);
    			attr_dev(div1, "class", div1_class_value = "file-icon " + (/*badFile*/ ctx[0] ? "badfile" : "upload") + " svelte-1qzoat3");
    			add_location(div1, file_1, 295, 6, 5629);
    			attr_dev(label0, "for", "file");
    			attr_dev(label0, "alt", "upload a csv file");
    			attr_dev(label0, "class", "svelte-1qzoat3");
    			add_location(label0, file_1, 294, 3, 5580);
    			attr_dev(div2, "class", "file-mgmt svelte-1qzoat3");
    			add_location(div2, file_1, 281, 0, 5317);
    			attr_dev(h50, "class", "svelte-1qzoat3");
    			add_location(h50, file_1, 319, 3, 6630);
    			attr_dev(input1, "class", "input svelte-1qzoat3");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "0.0625");
    			add_location(input1, file_1, 320, 3, 6661);
    			attr_dev(span0, "class", "svelte-1qzoat3");
    			add_location(span0, file_1, 326, 4, 6811);
    			attr_dev(input2, "class", "input svelte-1qzoat3");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "0.0625");
    			add_location(input2, file_1, 327, 4, 6830);
    			attr_dev(span1, "class", "svelte-1qzoat3");
    			add_location(span1, file_1, 333, 4, 6982);
    			attr_dev(input3, "class", "input svelte-1qzoat3");
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", "0.005");
    			add_location(input3, file_1, 334, 4, 7001);
    			attr_dev(div3, "class", "input-wrapper svelte-1qzoat3");
    			add_location(div3, file_1, 318, 0, 6599);
    			attr_dev(h51, "class", "svelte-1qzoat3");
    			add_location(h51, file_1, 342, 3, 7188);
    			attr_dev(input4, "class", "input svelte-1qzoat3");
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "step", "0.03125");
    			add_location(input4, file_1, 343, 3, 7208);
    			attr_dev(div4, "class", "input-wrapper svelte-1qzoat3");
    			add_location(div4, file_1, 341, 0, 7157);
    			attr_dev(h52, "class", "svelte-1qzoat3");
    			add_location(h52, file_1, 351, 3, 7395);
    			attr_dev(input5, "class", "input svelte-1qzoat3");
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "step", "0.03125");
    			add_location(input5, file_1, 352, 3, 7417);
    			attr_dev(div5, "class", "input-wrapper svelte-1qzoat3");
    			add_location(div5, file_1, 350, 0, 7364);
    			attr_dev(h53, "class", "svelte-1qzoat3");
    			add_location(h53, file_1, 364, 3, 7735);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "class", "svelte-1qzoat3");
    			add_location(input6, file_1, 365, 25, 7775);
    			attr_dev(div6, "class", "slider svelte-1qzoat3");
    			add_location(div6, file_1, 365, 80, 7830);
    			attr_dev(label1, "class", "switch svelte-1qzoat3");
    			add_location(label1, file_1, 365, 3, 7753);
    			attr_dev(div7, "class", "input-wrapper svelte-1qzoat3");
    			add_location(div7, file_1, 363, 0, 7704);
    			attr_dev(div8, "class", "settings svelte-1qzoat3");
    			add_location(div8, file_1, 317, 0, 6576);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, input0);
    			/*input0_binding*/ ctx[12](input0);
    			append_dev(div2, t2);
    			append_dev(div2, label0);
    			append_dev(label0, div1);
    			append_dev(div2, t3);
    			if_block.m(div2, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div3);
    			append_dev(div3, h50);
    			append_dev(div3, t6);
    			append_dev(div3, input1);
    			set_input_value(input1, /*$settings*/ ctx[5].material.width);
    			append_dev(div3, t7);
    			append_dev(div3, span0);
    			append_dev(div3, t9);
    			append_dev(div3, input2);
    			set_input_value(input2, /*$settings*/ ctx[5].material.height);
    			append_dev(div3, t10);
    			append_dev(div3, span1);
    			append_dev(div3, t12);
    			append_dev(div3, input3);
    			set_input_value(input3, /*$settings*/ ctx[5].material.thickness);
    			append_dev(div8, t13);
    			append_dev(div8, div4);
    			append_dev(div4, h51);
    			append_dev(div4, t15);
    			append_dev(div4, input4);
    			set_input_value(input4, /*$settings*/ ctx[5].material.margins);
    			append_dev(div8, t16);
    			append_dev(div8, div5);
    			append_dev(div5, h52);
    			append_dev(div5, t18);
    			append_dev(div5, input5);
    			set_input_value(input5, /*$settings*/ ctx[5].cutter);
    			append_dev(div8, t19);
    			append_dev(div8, div7);
    			append_dev(div7, h53);
    			append_dev(div7, t21);
    			append_dev(div7, label1);
    			append_dev(label1, input6);
    			input6.checked = /*$settings*/ ctx[5].units;
    			append_dev(label1, div6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*newFile*/ ctx[10], false, false, false),
    					listen_dev(input0, "change", /*loadFile*/ ctx[11], false, false, false),
    					listen_dev(div1, "mouseover", /*mouseover_handler*/ ctx[13], false, false, false),
    					listen_dev(input1, "change", /*calculateNest*/ ctx[9], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen_dev(input2, "change", /*calculateNest*/ ctx[9], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    					listen_dev(input3, "change", /*calculateNest*/ ctx[9], false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[16]),
    					listen_dev(input4, "change", /*calculateNest*/ ctx[9], false, false, false),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[17]),
    					listen_dev(input5, "change", /*calculateNest*/ ctx[9], false, false, false),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[18]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[19])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$csvFile*/ 4 && title_value !== (title_value = /*$csvFile*/ ctx[2].name || "Nest")) {
    				document.title = title_value;
    			}

    			if (dirty & /*badFile*/ 1 && div1_class_value !== (div1_class_value = "file-icon " + (/*badFile*/ ctx[0] ? "badfile" : "upload") + " svelte-1qzoat3")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}

    			if (dirty & /*$settings*/ 32 && to_number(input1.value) !== /*$settings*/ ctx[5].material.width) {
    				set_input_value(input1, /*$settings*/ ctx[5].material.width);
    			}

    			if (dirty & /*$settings*/ 32 && to_number(input2.value) !== /*$settings*/ ctx[5].material.height) {
    				set_input_value(input2, /*$settings*/ ctx[5].material.height);
    			}

    			if (dirty & /*$settings*/ 32 && to_number(input3.value) !== /*$settings*/ ctx[5].material.thickness) {
    				set_input_value(input3, /*$settings*/ ctx[5].material.thickness);
    			}

    			if (dirty & /*$settings*/ 32 && to_number(input4.value) !== /*$settings*/ ctx[5].material.margins) {
    				set_input_value(input4, /*$settings*/ ctx[5].material.margins);
    			}

    			if (dirty & /*$settings*/ 32 && to_number(input5.value) !== /*$settings*/ ctx[5].cutter) {
    				set_input_value(input5, /*$settings*/ ctx[5].cutter);
    			}

    			if (dirty & /*$settings*/ 32) {
    				input6.checked = /*$settings*/ ctx[5].units;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			/*input0_binding*/ ctx[12](null);
    			if_block.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div8);
    			mounted = false;
    			run_all(dispose);
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

    const csvHeaderRows = 5;

    function highlight() {
    	this.select();
    }

    function instance($$self, $$props, $$invalidate) {
    	let $csvFile;
    	let $sheets;
    	let $settings;
    	let $panels;
    	let $svg;
    	validate_store(csvFile, "csvFile");
    	component_subscribe($$self, csvFile, $$value => $$invalidate(2, $csvFile = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(4, $sheets = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(5, $settings = $$value));
    	validate_store(panels, "panels");
    	component_subscribe($$self, panels, $$value => $$invalidate(20, $panels = $$value));
    	validate_store(svg, "svg");
    	component_subscribe($$self, svg, $$value => $$invalidate(6, $svg = $$value));
    	let badFile = false;
    	let file;
    	let csv = $csvFile.contents.join("\n");

    	// gCode = "g00 \ng20"
    	beforeUpdate(() => {
    		if ($csvFile.contents > csvHeaderRows) {
    			calculateNest();
    		}
    	});

    	const today = formatDate(new Date(), "_yymmdd");

    	function calculateNest() {
    		let nest = Nest($csvFile.contents, csvHeaderRows, $settings.units, $settings.cutter, $settings.gap, $settings.material); // panel starting row csv
    		set_store_value(panels, $panels = nest[0]);
    		set_store_value(sheets, $sheets = nest[1]);
    		set_store_value(csvFile, $csvFile.errors = nest[2], $csvFile);
    	}

    	function newFile() {
    		set_store_value(csvFile, $csvFile = blancCSV);
    	}

    	function loadFile() {
    		if (file.files[0].name.includes(".csv")) {
    			set_store_value(csvFile, $csvFile.name = file.files[0].name.replace(".csv", ""), $csvFile);
    			let reader = new FileReader();
    			reader.readAsText(file.files[0]);

    			reader.onload = function (event) {
    				set_store_value(csvFile, $csvFile.contents = CSVToArray(event.target.result, csvHeaderRows), $csvFile); // csv file
    				calculateNest();
    				$$invalidate(0, badFile = false);
    			};
    		} else {
    			$$invalidate(0, badFile = true);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Import> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Import", $$slots, []);

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			file = $$value;
    			$$invalidate(1, file);
    		});
    	}

    	const mouseover_handler = () => $$invalidate(0, badFile = false);

    	function input1_input_handler() {
    		$settings.material.width = to_number(this.value);
    		settings.set($settings);
    	}

    	function input2_input_handler() {
    		$settings.material.height = to_number(this.value);
    		settings.set($settings);
    	}

    	function input3_input_handler() {
    		$settings.material.thickness = to_number(this.value);
    		settings.set($settings);
    	}

    	function input4_input_handler() {
    		$settings.material.margins = to_number(this.value);
    		settings.set($settings);
    	}

    	function input5_input_handler() {
    		$settings.cutter = to_number(this.value);
    		settings.set($settings);
    	}

    	function input6_change_handler() {
    		$settings.units = this.checked;
    		settings.set($settings);
    	}

    	$$self.$capture_state = () => ({
    		Nest,
    		Gcode,
    		settings,
    		panels,
    		sheets,
    		csvFile,
    		blancCSV,
    		svg,
    		saveAs: FileSaver_min.saveAs,
    		formatDate,
    		CSVToArray,
    		beforeUpdate,
    		badFile,
    		file,
    		csv,
    		csvHeaderRows,
    		today,
    		calculateNest,
    		newFile,
    		loadFile,
    		highlight,
    		$csvFile,
    		cnc,
    		$sheets,
    		$settings,
    		$panels,
    		$svg
    	});

    	$$self.$inject_state = $$props => {
    		if ("badFile" in $$props) $$invalidate(0, badFile = $$props.badFile);
    		if ("file" in $$props) $$invalidate(1, file = $$props.file);
    		if ("csv" in $$props) $$invalidate(7, csv = $$props.csv);
    		if ("cnc" in $$props) $$invalidate(3, cnc = $$props.cnc);
    	};

    	let cnc;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sheets, $settings, $csvFile*/ 52) {
    			 $$invalidate(3, cnc = () => Gcode($sheets, $settings.material, $csvFile.name));
    		}
    	};

    	return [
    		badFile,
    		file,
    		$csvFile,
    		cnc,
    		$sheets,
    		$settings,
    		$svg,
    		csv,
    		today,
    		calculateNest,
    		newFile,
    		loadFile,
    		input0_binding,
    		mouseover_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_change_handler
    	];
    }

    class Import extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Import",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Viewer.svelte generated by Svelte v3.24.1 */
    const file = "src/components/Viewer.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    // (177:12) {#each sheet.group as panel}
    function create_each_block_1(ctx) {
    	let rect;
    	let rect_class_value;
    	let rect_id_value;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_width_value;
    	let rect_height_value;
    	let text_1;
    	let t_value = /*panel*/ ctx[26].id + "";
    	let t;
    	let text_1_class_value;
    	let text_1_x_value;
    	let text_1_y_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			text_1 = svg_element("text");
    			t = text(t_value);

    			attr_dev(rect, "class", rect_class_value = "panel " + (/*$activePanel*/ ctx[4] == /*panel*/ ctx[26].id
    			? "active"
    			: "") + " print" + " svelte-jr6qit");

    			attr_dev(rect, "id", rect_id_value = /*panel*/ ctx[26].id);
    			attr_dev(rect, "x", rect_x_value = (/*panel*/ ctx[26].x0 + /*index*/ ctx[25] * /*sheet*/ ctx[23].sheet_width) * /*scale*/ ctx[5]);
    			attr_dev(rect, "y", rect_y_value = /*panel*/ ctx[26].y0 * /*scale*/ ctx[5]);
    			attr_dev(rect, "width", rect_width_value = /*panel*/ ctx[26].width * /*scale*/ ctx[5]);
    			attr_dev(rect, "height", rect_height_value = /*panel*/ ctx[26].height * /*scale*/ ctx[5]);
    			add_location(rect, file, 177, 16, 3604);

    			attr_dev(text_1, "class", text_1_class_value = "id " + (/*$activePanel*/ ctx[4] == /*panel*/ ctx[26].id
    			? "active"
    			: "") + " print" + " svelte-jr6qit");

    			attr_dev(text_1, "x", text_1_x_value = (/*panel*/ ctx[26].x0 + /*panel*/ ctx[26].width / 2 + /*index*/ ctx[25] * /*sheet*/ ctx[23].sheet_width) * /*scale*/ ctx[5]);
    			attr_dev(text_1, "y", text_1_y_value = (/*panel*/ ctx[26].y0 + 1 + /*panel*/ ctx[26].height / 2) * /*scale*/ ctx[5]);
    			add_location(text_1, file, 187, 20, 4095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(rect, "mouseover", /*mouseover_handler*/ ctx[8], false, false, false),
    					listen_dev(rect, "mouseleave", /*mouseleave_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activePanel, $sheets*/ 20 && rect_class_value !== (rect_class_value = "panel " + (/*$activePanel*/ ctx[4] == /*panel*/ ctx[26].id
    			? "active"
    			: "") + " print" + " svelte-jr6qit")) {
    				attr_dev(rect, "class", rect_class_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_id_value !== (rect_id_value = /*panel*/ ctx[26].id)) {
    				attr_dev(rect, "id", rect_id_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_x_value !== (rect_x_value = (/*panel*/ ctx[26].x0 + /*index*/ ctx[25] * /*sheet*/ ctx[23].sheet_width) * /*scale*/ ctx[5])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_y_value !== (rect_y_value = /*panel*/ ctx[26].y0 * /*scale*/ ctx[5])) {
    				attr_dev(rect, "y", rect_y_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_width_value !== (rect_width_value = /*panel*/ ctx[26].width * /*scale*/ ctx[5])) {
    				attr_dev(rect, "width", rect_width_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_height_value !== (rect_height_value = /*panel*/ ctx[26].height * /*scale*/ ctx[5])) {
    				attr_dev(rect, "height", rect_height_value);
    			}

    			if (dirty & /*$sheets*/ 4 && t_value !== (t_value = /*panel*/ ctx[26].id + "")) set_data_dev(t, t_value);

    			if (dirty & /*$activePanel, $sheets*/ 20 && text_1_class_value !== (text_1_class_value = "id " + (/*$activePanel*/ ctx[4] == /*panel*/ ctx[26].id
    			? "active"
    			: "") + " print" + " svelte-jr6qit")) {
    				attr_dev(text_1, "class", text_1_class_value);
    			}

    			if (dirty & /*$sheets*/ 4 && text_1_x_value !== (text_1_x_value = (/*panel*/ ctx[26].x0 + /*panel*/ ctx[26].width / 2 + /*index*/ ctx[25] * /*sheet*/ ctx[23].sheet_width) * /*scale*/ ctx[5])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$sheets*/ 4 && text_1_y_value !== (text_1_y_value = (/*panel*/ ctx[26].y0 + 1 + /*panel*/ ctx[26].height / 2) * /*scale*/ ctx[5])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if (detaching) detach_dev(text_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(177:12) {#each sheet.group as panel}",
    		ctx
    	});

    	return block;
    }

    // (164:4) {#each $sheets as sheet, index}
    function create_each_block(ctx) {
    	let g0;
    	let rect;
    	let rect_id_value;
    	let rect_x_value;
    	let rect_width_value;
    	let rect_height_value;
    	let g1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*sheet*/ ctx[23].group;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			g0 = svg_element("g");
    			rect = svg_element("rect");
    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "class", "sheet print svelte-jr6qit");
    			attr_dev(rect, "id", rect_id_value = /*sheet*/ ctx[23].id);
    			attr_dev(rect, "x", rect_x_value = /*index*/ ctx[25] * /*sheet*/ ctx[23].sheet_width * /*scale*/ ctx[5]);
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", rect_width_value = /*sheet*/ ctx[23].sheet_width * /*scale*/ ctx[5]);
    			attr_dev(rect, "height", rect_height_value = /*sheet*/ ctx[23].sheet_height * /*scale*/ ctx[5]);
    			add_location(rect, file, 165, 12, 3168);
    			attr_dev(g0, "id", "sheets");
    			attr_dev(g0, "class", "svelte-jr6qit");
    			add_location(g0, file, 164, 8, 3140);
    			attr_dev(g1, "id", "panels");
    			attr_dev(g1, "class", "svelte-jr6qit");
    			add_location(g1, file, 175, 8, 3531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g0, anchor);
    			append_dev(g0, rect);
    			insert_dev(target, g1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(rect, "mouseover", /*showInfo*/ ctx[6], false, false, false),
    					listen_dev(rect, "mouseleave", /*hideInfo*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sheets*/ 4 && rect_id_value !== (rect_id_value = /*sheet*/ ctx[23].id)) {
    				attr_dev(rect, "id", rect_id_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_x_value !== (rect_x_value = /*index*/ ctx[25] * /*sheet*/ ctx[23].sheet_width * /*scale*/ ctx[5])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_width_value !== (rect_width_value = /*sheet*/ ctx[23].sheet_width * /*scale*/ ctx[5])) {
    				attr_dev(rect, "width", rect_width_value);
    			}

    			if (dirty & /*$sheets*/ 4 && rect_height_value !== (rect_height_value = /*sheet*/ ctx[23].sheet_height * /*scale*/ ctx[5])) {
    				attr_dev(rect, "height", rect_height_value);
    			}

    			if (dirty & /*$activePanel, $sheets, scale*/ 52) {
    				each_value_1 = /*sheet*/ ctx[23].group;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g0);
    			if (detaching) detach_dev(g1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(164:4) {#each $sheets as sheet, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let svg_1;
    	let svg_1_width_value;
    	let svg_1_height_value;
    	let svg_1_viewBox_value;
    	let each_value = /*$sheets*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg_1 = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(svg_1, "class", "print svelte-jr6qit");
    			attr_dev(svg_1, "version", "1.1");
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg_1, "width", svg_1_width_value = /*viewBoxW*/ ctx[1] * /*scale*/ ctx[5]);
    			attr_dev(svg_1, "height", svg_1_height_value = /*viewBoxH*/ ctx[3] * /*scale*/ ctx[5]);
    			attr_dev(svg_1, "viewBox", svg_1_viewBox_value = "0 0 " + /*viewBoxW*/ ctx[1] * /*scale*/ ctx[5] + " " + /*viewBoxH*/ ctx[3] * /*scale*/ ctx[5]);
    			attr_dev(svg_1, "preserveAspectRatio", "xMidYMid meet");
    			add_location(svg_1, file, 154, 0, 2811);
    			attr_dev(div, "class", "viewer svelte-jr6qit");
    			add_location(div, file, 153, 0, 2767);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg_1, null);
    			}

    			/*div_binding*/ ctx[10](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$sheets, $activePanel, scale, showInfo, hideInfo*/ 244) {
    				each_value = /*$sheets*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg_1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*viewBoxW*/ 2 && svg_1_width_value !== (svg_1_width_value = /*viewBoxW*/ ctx[1] * /*scale*/ ctx[5])) {
    				attr_dev(svg_1, "width", svg_1_width_value);
    			}

    			if (dirty & /*viewBoxH*/ 8 && svg_1_height_value !== (svg_1_height_value = /*viewBoxH*/ ctx[3] * /*scale*/ ctx[5])) {
    				attr_dev(svg_1, "height", svg_1_height_value);
    			}

    			if (dirty & /*viewBoxW, viewBoxH*/ 10 && svg_1_viewBox_value !== (svg_1_viewBox_value = "0 0 " + /*viewBoxW*/ ctx[1] * /*scale*/ ctx[5] + " " + /*viewBoxH*/ ctx[3] * /*scale*/ ctx[5])) {
    				attr_dev(svg_1, "viewBox", svg_1_viewBox_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[10](null);
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
    	let $sheets;
    	let $settings;
    	let $svg;
    	let $activePanel;
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(2, $sheets = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(17, $settings = $$value));
    	validate_store(svg, "svg");
    	component_subscribe($$self, svg, $$value => $$invalidate(18, $svg = $$value));
    	validate_store(activePanel, "activePanel");
    	component_subscribe($$self, activePanel, $$value => $$invalidate(4, $activePanel = $$value));

    	let id,
    		width,
    		height,
    		displayInfo = false,
    		mx = 0,
    		my = 0,
    		top = 0,
    		left = 0,
    		scale = 90,
    		svgFile; // inches to pixels

    	afterUpdate(() => {
    		if ($sheets.length) {
    			set_store_value(svg, $svg = svgFile.innerHTML.toString());
    		}
    	});

    	function panelHoverOn() {
    		set_store_value(activePanel, $activePanel = this.id);
    	}

    	function panelHoverOff(event) {
    		set_store_value(activePanel, $activePanel = "");
    	}

    	function showInfo() {
    		set_store_value(activePanel, $activePanel = this.id);
    		displayInfo = true;
    		let rect = this.getBoundingClientRect();
    		top = rect.bottom + 12;
    		left = rect.left + 12;
    		id = this.id;
    		width = this.width.baseVal.valueAsString;
    		height = this.height.baseVal.valueAsString;
    	}

    	function hideInfo(event) {
    		displayInfo = false;
    		set_store_value(activePanel, $activePanel = "");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Viewer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Viewer", $$slots, []);
    	const mouseover_handler = () => set_store_value(activePanel, $activePanel = this.id);
    	const mouseleave_handler = () => set_store_value(activePanel, $activePanel = "");

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			svgFile = $$value;
    			$$invalidate(0, svgFile);
    		});
    	}

    	$$self.$capture_state = () => ({
    		panels,
    		sheets,
    		settings,
    		svg,
    		activePanel,
    		afterUpdate,
    		id,
    		width,
    		height,
    		displayInfo,
    		mx,
    		my,
    		top,
    		left,
    		scale,
    		svgFile,
    		panelHoverOn,
    		panelHoverOff,
    		showInfo,
    		hideInfo,
    		viewBoxW,
    		$sheets,
    		$settings,
    		viewBoxH,
    		$svg,
    		$activePanel
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) id = $$props.id;
    		if ("width" in $$props) width = $$props.width;
    		if ("height" in $$props) height = $$props.height;
    		if ("displayInfo" in $$props) displayInfo = $$props.displayInfo;
    		if ("mx" in $$props) mx = $$props.mx;
    		if ("my" in $$props) my = $$props.my;
    		if ("top" in $$props) top = $$props.top;
    		if ("left" in $$props) left = $$props.left;
    		if ("scale" in $$props) $$invalidate(5, scale = $$props.scale);
    		if ("svgFile" in $$props) $$invalidate(0, svgFile = $$props.svgFile);
    		if ("viewBoxW" in $$props) $$invalidate(1, viewBoxW = $$props.viewBoxW);
    		if ("viewBoxH" in $$props) $$invalidate(3, viewBoxH = $$props.viewBoxH);
    	};

    	let viewBoxW;
    	let viewBoxH;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sheets, $settings*/ 131076) {
    			 $$invalidate(1, viewBoxW = $sheets.length * $settings.material.width);
    		}

    		if ($$self.$$.dirty & /*$settings*/ 131072) {
    			 $$invalidate(3, viewBoxH = $settings.material.height);
    		}
    	};

    	return [
    		svgFile,
    		viewBoxW,
    		$sheets,
    		viewBoxH,
    		$activePanel,
    		scale,
    		showInfo,
    		hideInfo,
    		mouseover_handler,
    		mouseleave_handler,
    		div_binding
    	];
    }

    class Viewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Viewer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/CSV.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/components/CSV.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[22] = list;
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (121:8) {#if $csvFile.name}
    function create_if_block$1(ctx) {
    	let t0;
    	let ul0;
    	let t1;
    	let input;
    	let t2;
    	let ul1;
    	let li0;
    	let t4;
    	let li1;
    	let t6;
    	let li2;
    	let t8;
    	let li3;
    	let t10;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*$csvFile*/ ctx[1].errors.length && create_if_block_1(ctx);
    	let each_value = /*lines*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			ul0 = element("ul");
    			t1 = text("PROJECT: ");
    			input = element("input");
    			t2 = space();
    			ul1 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Panel";
    			t4 = space();
    			li1 = element("li");
    			li1.textContent = "Q";
    			t6 = space();
    			li2 = element("li");
    			li2.textContent = "W";
    			t8 = space();
    			li3 = element("li");
    			li3.textContent = "H";
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(input, "name", "title");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-ajp25j");
    			add_location(input, file$1, 129, 25, 2774);
    			attr_dev(ul0, "class", "svelte-ajp25j");
    			add_location(ul0, file$1, 129, 12, 2761);
    			attr_dev(li0, "class", "svelte-ajp25j");
    			add_location(li0, file$1, 133, 16, 2888);
    			attr_dev(li1, "class", "svelte-ajp25j");
    			add_location(li1, file$1, 134, 16, 2953);
    			attr_dev(li2, "class", "svelte-ajp25j");
    			add_location(li2, file$1, 135, 16, 3015);
    			attr_dev(li3, "class", "svelte-ajp25j");
    			add_location(li3, file$1, 136, 16, 3077);
    			attr_dev(ul1, "class", "svelte-ajp25j");
    			add_location(ul1, file$1, 132, 12, 2867);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul0, anchor);
    			append_dev(ul0, t1);
    			append_dev(ul0, input);
    			set_input_value(input, /*$csvFile*/ ctx[1].contents[0][1]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li0);
    			append_dev(ul1, t4);
    			append_dev(ul1, li1);
    			append_dev(ul1, t6);
    			append_dev(ul1, li2);
    			append_dev(ul1, t8);
    			append_dev(ul1, li3);
    			insert_dev(target, t10, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(li0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(li1, "click", /*click_handler_1*/ ctx[9], false, false, false),
    					listen_dev(li2, "click", /*click_handler_2*/ ctx[10], false, false, false),
    					listen_dev(li3, "click", /*click_handler_3*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*$csvFile*/ ctx[1].errors.length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$csvFile*/ 2 && input.value !== /*$csvFile*/ ctx[1].contents[0][1]) {
    				set_input_value(input, /*$csvFile*/ ctx[1].contents[0][1]);
    			}

    			if (dirty & /*$activePanel, lines, highlight, calculateNest*/ 13) {
    				each_value = /*lines*/ ctx[0];
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
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t10);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(121:8) {#if $csvFile.name}",
    		ctx
    	});

    	return block;
    }

    // (123:12) {#if $csvFile.errors.length}
    function create_if_block_1(ctx) {
    	let h5;
    	let t0;
    	let t1_value = (/*$csvFile*/ ctx[1].errors.length > 1 ? "S" : "") + "";
    	let t1;
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value_1 = /*$csvFile*/ ctx[1].errors;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t0 = text("ERROR");
    			t1 = text(t1_value);
    			t2 = text(":");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h5, file$1, 123, 16, 2567);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$csvFile*/ 2 && t1_value !== (t1_value = (/*$csvFile*/ ctx[1].errors.length > 1 ? "S" : "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$csvFile*/ 2) {
    				each_value_1 = /*$csvFile*/ ctx[1].errors;
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
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(123:12) {#if $csvFile.errors.length}",
    		ctx
    	});

    	return block;
    }

    // (125:16) {#each $csvFile.errors as error}
    function create_each_block_1$1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[24] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$1, 125, 20, 2691);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$csvFile*/ 2 && t_value !== (t_value = /*error*/ ctx[24] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(125:16) {#each $csvFile.errors as error}",
    		ctx
    	});

    	return block;
    }

    // (139:12) {#each lines as line}
    function create_each_block$1(ctx) {
    	let ul;
    	let li0;
    	let input0;
    	let t0;
    	let li1;
    	let input1;
    	let t1;
    	let li2;
    	let input2;
    	let t2;
    	let li3;
    	let input3;
    	let t3;
    	let ul_class_value;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[12].call(input0, /*each_value*/ ctx[22], /*line_index*/ ctx[23]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[13].call(input1, /*each_value*/ ctx[22], /*line_index*/ ctx[23]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[14].call(input2, /*each_value*/ ctx[22], /*line_index*/ ctx[23]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[15].call(input3, /*each_value*/ ctx[22], /*line_index*/ ctx[23]);
    	}

    	function mouseenter_handler(...args) {
    		return /*mouseenter_handler*/ ctx[16](/*line*/ ctx[21], ...args);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			input0 = element("input");
    			t0 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t1 = space();
    			li2 = element("li");
    			input2 = element("input");
    			t2 = space();
    			li3 = element("li");
    			input3 = element("input");
    			t3 = space();
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-ajp25j");
    			add_location(input0, file$1, 145, 24, 3457);
    			attr_dev(li0, "class", "svelte-ajp25j");
    			add_location(li0, file$1, 144, 20, 3428);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "svelte-ajp25j");
    			add_location(input1, file$1, 152, 24, 3735);
    			attr_dev(li1, "class", "svelte-ajp25j");
    			add_location(li1, file$1, 151, 20, 3706);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "0.03125");
    			attr_dev(input2, "class", "svelte-ajp25j");
    			add_location(input2, file$1, 159, 24, 4016);
    			attr_dev(li2, "class", "svelte-ajp25j");
    			add_location(li2, file$1, 158, 20, 3987);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", "0.03125");
    			attr_dev(input3, "class", "svelte-ajp25j");
    			add_location(input3, file$1, 167, 24, 4339);
    			attr_dev(li3, "class", "svelte-ajp25j");
    			add_location(li3, file$1, 166, 20, 4310);

    			attr_dev(ul, "class", ul_class_value = "" + (null_to_empty(/*$activePanel*/ ctx[2] == /*line*/ ctx[21][0]
    			? "active"
    			: "") + " svelte-ajp25j"));

    			add_location(ul, file$1, 139, 16, 3191);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, input0);
    			set_input_value(input0, /*line*/ ctx[21][0]);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			set_input_value(input1, /*line*/ ctx[21][1]);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			append_dev(li2, input2);
    			set_input_value(input2, /*line*/ ctx[21][2]);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			append_dev(li3, input3);
    			set_input_value(input3, /*line*/ ctx[21][3]);
    			append_dev(ul, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input0, "focus", highlight$1, false, false, false),
    					listen_dev(input0, "keyup", /*calculateNest*/ ctx[3], false, false, false),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input1, "focus", highlight$1, false, false, false),
    					listen_dev(input1, "keyup", /*calculateNest*/ ctx[3], false, false, false),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(input2, "focus", highlight$1, false, false, false),
    					listen_dev(input2, "keyup", /*calculateNest*/ ctx[3], false, false, false),
    					listen_dev(input3, "input", input3_input_handler),
    					listen_dev(input3, "focus", highlight$1, false, false, false),
    					listen_dev(input3, "keyup", /*calculateNest*/ ctx[3], false, false, false),
    					listen_dev(ul, "mouseenter", mouseenter_handler, false, false, false),
    					listen_dev(ul, "mouseleave", /*mouseleave_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*lines*/ 1 && input0.value !== /*line*/ ctx[21][0]) {
    				set_input_value(input0, /*line*/ ctx[21][0]);
    			}

    			if (dirty & /*lines*/ 1 && to_number(input1.value) !== /*line*/ ctx[21][1]) {
    				set_input_value(input1, /*line*/ ctx[21][1]);
    			}

    			if (dirty & /*lines*/ 1 && to_number(input2.value) !== /*line*/ ctx[21][2]) {
    				set_input_value(input2, /*line*/ ctx[21][2]);
    			}

    			if (dirty & /*lines*/ 1 && to_number(input3.value) !== /*line*/ ctx[21][3]) {
    				set_input_value(input3, /*line*/ ctx[21][3]);
    			}

    			if (dirty & /*$activePanel, lines*/ 5 && ul_class_value !== (ul_class_value = "" + (null_to_empty(/*$activePanel*/ ctx[2] == /*line*/ ctx[21][0]
    			? "active"
    			: "") + " svelte-ajp25j"))) {
    				attr_dev(ul, "class", ul_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(139:12) {#each lines as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let ul;
    	let mounted;
    	let dispose;
    	let if_block = /*$csvFile*/ ctx[1].name && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			ul = element("ul");
    			ul.textContent = "+";
    			attr_dev(ul, "class", "new-row svelte-ajp25j");
    			add_location(ul, file$1, 177, 8, 4677);
    			attr_dev(div0, "class", "svelte-ajp25j");
    			add_location(div0, file$1, 119, 4, 2475);
    			attr_dev(div1, "class", "container svelte-ajp25j");
    			add_location(div1, file$1, 118, 0, 2447);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, ul);

    			if (!mounted) {
    				dispose = listen_dev(ul, "click", /*addRow*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$csvFile*/ ctx[1].name) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
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

    const csvHeaderRows$1 = 5;

    //    beforeUpdate(() => {
    //       if ( $csvFile.contents ) {
    //          calculateNest()
    //       }
    //     })
    function highlight$1() {
    	this.select();
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $csvFile;
    	let $settings;
    	let $panels;
    	let $sheets;
    	let $activePanel;
    	validate_store(csvFile, "csvFile");
    	component_subscribe($$self, csvFile, $$value => $$invalidate(1, $csvFile = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(18, $settings = $$value));
    	validate_store(panels, "panels");
    	component_subscribe($$self, panels, $$value => $$invalidate(19, $panels = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(20, $sheets = $$value));
    	validate_store(activePanel, "activePanel");
    	component_subscribe($$self, activePanel, $$value => $$invalidate(2, $activePanel = $$value));

    	function calculateNest() {
    		let nest = Nest($csvFile.contents, csvHeaderRows$1, $settings.units, $settings.cutter, $settings.gap, $settings.material); // panel starting row csv
    		set_store_value(panels, $panels = nest[0]);
    		set_store_value(sheets, $sheets = nest[1]);
    		set_store_value(csvFile, $csvFile.errors = nest[2], $csvFile);
    	}

    	// function reset() {
    	//     console.log(Object.isFrozen($csvFile.original));
    	//     $csvFile.contents = [...$csvFile.original]
    	//     lines = $csvFile.contents.slice(4)
    	//     console.log(Object.isFrozen($csvFile.original));
    	// }
    	function addRow() {
    		let row = [lines.length + 1,,];
    		set_store_value(csvFile, $csvFile.contents = [...$csvFile.contents, row], $csvFile);
    	}

    	function sortAscending(index) {
    		//add support for alpha numberic
    		$$invalidate(0, lines = lines.sort((a, b) => a[index] - b[index]));
    	}

    	function sortDescending(index) {
    		$$invalidate(0, lines = lines.sort((a, b) => b[index] - a[index]));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CSV> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CSV", $$slots, []);

    	function input_input_handler() {
    		$csvFile.contents[0][1] = this.value;
    		csvFile.set($csvFile);
    	}

    	const click_handler = () => sortAscending(0);
    	const click_handler_1 = () => sortDescending(1);
    	const click_handler_2 = () => sortDescending(2);
    	const click_handler_3 = () => sortDescending(3);

    	function input0_input_handler(each_value, line_index) {
    		each_value[line_index][0] = this.value;
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	function input1_input_handler(each_value, line_index) {
    		each_value[line_index][1] = to_number(this.value);
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	function input2_input_handler(each_value, line_index) {
    		each_value[line_index][2] = to_number(this.value);
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	function input3_input_handler(each_value, line_index) {
    		each_value[line_index][3] = to_number(this.value);
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	const mouseenter_handler = line => set_store_value(activePanel, $activePanel = line[0]);
    	const mouseleave_handler = () => set_store_value(activePanel, $activePanel = "");

    	$$self.$capture_state = () => ({
    		sheets,
    		csvFile,
    		settings,
    		panels,
    		activePanel,
    		trunc,
    		Nest,
    		beforeUpdate,
    		csvHeaderRows: csvHeaderRows$1,
    		highlight: highlight$1,
    		calculateNest,
    		addRow,
    		sortAscending,
    		sortDescending,
    		lines,
    		$csvFile,
    		$settings,
    		$panels,
    		$sheets,
    		$activePanel
    	});

    	$$self.$inject_state = $$props => {
    		if ("lines" in $$props) $$invalidate(0, lines = $$props.lines);
    	};

    	let lines;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$csvFile*/ 2) {
    			 $$invalidate(0, lines = $csvFile.contents.slice(csvHeaderRows$1));
    		}
    	};

    	return [
    		lines,
    		$csvFile,
    		$activePanel,
    		calculateNest,
    		addRow,
    		sortAscending,
    		sortDescending,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class CSV extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CSV",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Info.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/components/Info.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (20:4) {#if $csvFile.name}
    function create_if_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*$sheets*/ ctx[1].length > 1 && create_if_block_1$1(ctx);

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
    			if (/*$sheets*/ ctx[1].length > 1) {
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(20:4) {#if $csvFile.name}",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#if $sheets.length > 1}
    function create_if_block_1$1(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let t3_value = parseInt(/*$sheets*/ ctx[1].slice(0, -1).reduce(func, 0)) + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "filled sheets";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("waste: ");
    			t3 = text(t3_value);
    			t4 = text("%");
    			add_location(p0, file$2, 21, 12, 367);
    			add_location(p1, file$2, 22, 12, 400);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sheets*/ 2 && t3_value !== (t3_value = parseInt(/*$sheets*/ ctx[1].slice(0, -1).reduce(func, 0)) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(21:8) {#if $sheets.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#each $sheets as sheet, index}
    function create_each_block$2(ctx) {
    	let div;
    	let h4;
    	let t0_value = /*sheet*/ ctx[2].id + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3_value = trunc(/*sheet*/ ctx[2].area / 144, 2) + "";
    	let t3;
    	let t4;
    	let sup0;
    	let t6;
    	let p1;
    	let t7;
    	let t8_value = trunc(/*sheet*/ ctx[2].waste_area / 144, 2) + "";
    	let t8;
    	let t9;
    	let sup1;
    	let t11;
    	let p2;
    	let t12;
    	let t13_value = trunc(/*sheet*/ ctx[2].waste_ratio * 100, 2) + "";
    	let t13;
    	let t14;
    	let t15;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text("used area: ");
    			t3 = text(t3_value);
    			t4 = text(" pi");
    			sup0 = element("sup");
    			sup0.textContent = "2";
    			t6 = space();
    			p1 = element("p");
    			t7 = text("waste area: ");
    			t8 = text(t8_value);
    			t9 = text(" pi");
    			sup1 = element("sup");
    			sup1.textContent = "2";
    			t11 = space();
    			p2 = element("p");
    			t12 = text("waste: ");
    			t13 = text(t13_value);
    			t14 = text("%");
    			t15 = space();
    			add_location(h4, file$2, 33, 8, 688);
    			attr_dev(sup0, "class", "svelte-18pxdu6");
    			add_location(sup0, file$2, 34, 54, 762);
    			add_location(p0, file$2, 34, 8, 716);
    			attr_dev(sup1, "class", "svelte-18pxdu6");
    			add_location(sup1, file$2, 35, 60, 839);
    			add_location(p1, file$2, 35, 8, 787);
    			add_location(p2, file$2, 36, 8, 864);
    			attr_dev(div, "class", "svelte-18pxdu6");
    			add_location(div, file$2, 32, 4, 674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, sup0);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, sup1);
    			append_dev(div, t11);
    			append_dev(div, p2);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(p2, t14);
    			append_dev(div, t15);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sheets*/ 2 && t0_value !== (t0_value = /*sheet*/ ctx[2].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$sheets*/ 2 && t3_value !== (t3_value = trunc(/*sheet*/ ctx[2].area / 144, 2) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$sheets*/ 2 && t8_value !== (t8_value = trunc(/*sheet*/ ctx[2].waste_area / 144, 2) + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*$sheets*/ 2 && t13_value !== (t13_value = trunc(/*sheet*/ ctx[2].waste_ratio * 100, 2) + "")) set_data_dev(t13, t13_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(32:0) {#each $sheets as sheet, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t;
    	let each_1_anchor;
    	let if_block = /*$csvFile*/ ctx[0].name && create_if_block$2(ctx);
    	let each_value = /*$sheets*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(div, "class", "svelte-18pxdu6");
    			add_location(div, file$2, 18, 0, 292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$csvFile*/ ctx[0].name) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*trunc, $sheets*/ 2) {
    				each_value = /*$sheets*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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

    const func = (total, waste, i, array) => total + waste.waste_ratio * 100 / array.length;

    function instance$3($$self, $$props, $$invalidate) {
    	let $csvFile;
    	let $sheets;
    	validate_store(csvFile, "csvFile");
    	component_subscribe($$self, csvFile, $$value => $$invalidate(0, $csvFile = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(1, $sheets = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Info", $$slots, []);

    	$$self.$capture_state = () => ({
    		sheets,
    		csvFile,
    		trunc,
    		$csvFile,
    		$sheets
    	});

    	return [$csvFile, $sheets];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/App.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let div0;
    	let import_1;
    	let t0;
    	let div1;
    	let csv;
    	let t1;
    	let viewer;
    	let t2;
    	let div2;
    	let info;
    	let current;
    	import_1 = new Import({ $$inline: true });
    	csv = new CSV({ $$inline: true });
    	viewer = new Viewer({ $$inline: true });
    	info = new Info({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(import_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(csv.$$.fragment);
    			t1 = space();
    			create_component(viewer.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(info.$$.fragment);
    			attr_dev(div0, "class", "import svelte-99m0r7");
    			add_location(div0, file$3, 32, 2, 682);
    			attr_dev(div1, "class", "main svelte-99m0r7");
    			add_location(div1, file$3, 43, 2, 859);
    			attr_dev(div2, "class", "info svelte-99m0r7");
    			add_location(div2, file$3, 47, 2, 916);
    			attr_dev(div3, "class", "container svelte-99m0r7");
    			add_location(div3, file$3, 31, 0, 656);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(import_1, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			mount_component(csv, div1, null);
    			append_dev(div1, t1);
    			mount_component(viewer, div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(info, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(import_1.$$.fragment, local);
    			transition_in(csv.$$.fragment, local);
    			transition_in(viewer.$$.fragment, local);
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(import_1.$$.fragment, local);
    			transition_out(csv.$$.fragment, local);
    			transition_out(viewer.$$.fragment, local);
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(import_1);
    			destroy_component(csv);
    			destroy_component(viewer);
    			destroy_component(info);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Import, Viewer, CSV, Info, sheets });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
