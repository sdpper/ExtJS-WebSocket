/**
 * @class Ext.ux.WebSocketManager
 * @author Vincenzo Ferrari <wilk3ert@gmail.com>
 * @singleton
 * 
 * Manager of Ext.ux.WebSocket
 * 
 * This singleton provide some useful functions to use for many websockets.
 * 
 *     var ws1 = Ext.create ('Ext.ux.WebSocket', {
 *       url: 'http://localhost:8888'
 *     });
 *     
 *     Ext.ux.WebSocketManager.register (ws1);
 *     
 *     var ws2 = Ext.create ('Ext.ux.WebSocket', {
 *       url: 'http://localhost:8900'
 *     });
 *     
 *     Ext.ux.WebSocketManager.register (ws2);
 *     
 *     var ws3 = Ext.create ('Ext.ux.WebSocket', {
 *       url: 'http://localhost:8950'
 *     });
 *     
 *     Ext.ux.WebSocketManager.register (ws3);
 *     
 *     Ext.ux.WebSocketManager.broadcast ('system shutdown', 'BROADCAST: the system will shutdown in few minutes.');
 *     
 *     Ext.ux.WebSocketManager.disconnectAll ();
 *     
 *     Ext.ux.WebSocketManager.unregister (ws1);
 *     Ext.ux.WebSocketManager.unregister (ws2);
 *     Ext.ux.WebSocketManager.unregister (ws3);
 */
Ext.define ('Ext.ux.WebSocketManager', {
	singleton: true ,
	
	/**
	 * @property {Ext.util.HashMap} wsList
	 * @private
	 */
	wsList: Ext.create ('Ext.util.HashMap') ,
	
	/**
	 * @method register
	 * Registers an Ext.ux.WebSocket
	 * @param {Ext.ux.WebSocket/Ext.ux.WebSocket[]} websockets WebSockets to register. Could be only one.
	 */
	register: function (websockets) {
		// Changes websockets into an array in every case
		if (Ext.isObject (websockets)) websockets = [websockets];
		
		for (var i in websockets) {
			if (!Ext.isEmpty (websockets[i].url)) this.wsList.add (websockets[i].url, websockets[i]);
		}
	} ,
	
	/**
	 * @method contains
	 * Checks if a websocket is already registered or not
	 * @param {Ext.ux.WebSocket} websocket The WebSocket to find
	 * @return {Boolean} True if the websocket is already registered, False otherwise
	 */
	contains: function (websocket) {
		return this.wsList.containsKey (websocket.url);
	} ,
	
	/**
	 * @method get
	 * Retrieves a registered websocket by its url
	 * @param {String} url The url of the websocket to search
	 * @return {Ext.ux.WebSocket} The websocket or undefined
	 */
	get: function (url) {
		return this.wsList.get (url);
	} ,
	
	/**
	 * @method each
	 * Executes a function for each registered websocket
	 * @param {Function} fn The function to execute
	 */
	each: function (fn) {
		this.wsList.each (function (url, websocket, len) {
			fn (websocket);
		});
	} ,
	
	/**
	 * @method unregister
	 * Unregisters an Ext.ux.WebSocket
	 * @param {Ext.ux.WebSocket/Ext.ux.WebSocket[]} websockets WebSockets to unregister
	 */
	unregister: function (websockets) {
		if (Ext.isObject (websockets)) websockets = [websockets];
		
		for (var i in websockets) {
			if (this.wsList.containsKey (websockets[i].url)) this.wsList.removeAtKey (websockets[i].url);
		}
	} ,
	
	/**
	 * @method broadcast
	 * Sends a message to each websocket
	 * @param {String} event The event to raise
	 * @param {String/Object} message The data to send
	 */
	broadcast: function (event, message) {
		this.wsList.each (function (url, websocket, len) {
			if (websocket.isReady ()) websocket.send (event, message);
		});
	} ,
	
	/**
	 * @method multicast
	 * Sends a message to each websocket, except those specified
	 * @param {Ext.ux.WebSocket/Ext.ux.WebSocket[]} websockets An array of websockets to take off the communication
	 * @param {String} event The event to raise
	 * @param {String/Object} message The data to send
	 */
	multicast: function (websockets, event, message) {
		var me = this;
		
		// If there's no websockets to exclude, treats it as broadcast
		if ((websockets === undefined) || (websockets === null)) {
			me.broadcast (event, message);
		}
		// If it's a single websocket, it's changed as an array
		else if (Ext.isObject (websockets)) websockets = [websockets];
		
		if (Ext.isArray (websockets)) {
			var list = me.wsList;
			
			// Exclude websockets from the communication
			for (var i in websockets) {
				list.removeAtKey (websockets[i]);
			}
			
			list.each (function (url, websocket, len) {
				if (websocket.isReady ()) websocket.send (event, message);
			});
		}
	} ,
	
	/**
	 * @method disconnect
	 * Disconnects a websocket
	 * @param {Ext.ux.WebSocket.Wrapper} websocket The websocket to disconnect
	 */
	disconnect: function (websocket) {
		var me = this;
		
		if (me.wsList.containsKey (websocket.url)) {
			me.wsList.get(websocket.url).disconnect ();
			me.wsList.removeAtKey (websocket.url);
		}
	} ,
	
	/**
	 * @method disconnectAll
	 * Disconnects every websocket
	 */
	disconnectAll: function () {
		this.wsList.each (function (url, websocket, len) {
			websocket.disconnect ();
		});
	}
});
