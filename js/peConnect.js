var peConnect = ( function(){

  // The callbacks called when an action is received
  var _actionCallbacks = [_parseConnectData];
  // The callbacks called when connected to a new run
  var _newRunCallbacks = [];

  // Connection socket
  var _socket;

  // Connection information
  var _host;
  var _port;
  var _runID;
  
  // Output function for connection information
  var _output;

  // Debug function for debug purposes
  var _debug;


  function _connect(options){
    /*
      Initiator.
      Connects with the popup-escape system
    */

    var defaults = {
      host: "localhost",
      actionCallbacks: [],
      newRunCallbacks: [],
      runID: "",
      output: console.log,
      debug:true,
      port:8000
    }
    options = Object.assign(defaults, options);

    _subscribeActionData(options.actionCallbacks);
    _subscribeNewRun(options.newRunCallbacks);

    _host = options.host;
    _port = options.port;
    _output = options.output;
    _debug = options.debug;

    if(options.runID){
      _changeRunID(_runID);
    } else{
      var url = _createURL();
      _openConnection(url);
    }

  };

  function _openConnection(url){
    /*
      Opens a connection. If a connection already exists, close it first.
      Notifies the action callback with the message.
    */
    if(_socket){
      _socket.close();
    }
    _socket = new ReconnectingWebSocket(url);
    
    _socket.onopen = function (e) {
      if(_debug)
        console.log("Open", e);
    };
    _socket.onmessage = function (e) {
      var data = JSON.parse(e.data);
      if(_debug)
        console.log("Data received", data);
      for( callback of _actionCallbacks){
        callback(data);
      }
    }
  };

  function _parseConnectData(data){
    /*
      Function which parses the relevant data for the connection
      part of popup-escape. 
    */

    // If it's not connected, react to the connection-code or
    // the received runID
    if(!_isConnected()){
      if(data['code']) {
        _output("Connect code:", data['code']);
        return;
      }
      if(data['id']) {
        _changeRunID(data['id']);
        return;
      }
    }
    
    // If it's connected, listen to a redirect with a run.
    if(data['action'] == "REDIRECT" && data['run']){
      _changeRunID(data['run']);
      return;
    }
  };

  function _isConnected(){
    /*
      Checks if we are connected to a RUN
    */
    if(_debug)
      console.log("RunID: ", _runID, !!_runID);
    return !!_runID;
  }


  function _changeRunID(ID){
    /*
      Changes the RUN ID, conencts to this run and notifies the callbacks.
    */
    _runID = ID;

    var url = _createURL(ID+"/")
    for(callback of _newRunCallbacks){
      console.log(callback)
      if(callback)
        callback();
    }

    _openConnection(url);
  };

  function _createURL(section=""){
    /*
      Create a url which connects to the Popup-escape system
    */
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var url = ws_scheme + '://' + _host + ':' + _port + '/run/' + section;
    return url;
  };


  /*
    Subscription managers
  */
  function _subscribeActionData(subscriber){
    if(Array.isArray(subscriber)){
      _actionCallbacks.concat(subscriber);
    } else {
      _actionCallbacks.push(subscriber);
    }
  };

  function _subscribeNewRun(subscriber){
    if(Array.isArray(subscriber)){
      _newRunCallbacks.concat(subscriber);
    } else {
      _newRunCallbacks.push(subscriber);
    }
  };

  function _setOutput(output){
    this._output = output;
  }

  /*
    Module signature, public functions
  */
  return  {
    connect: _connect,
    subscribeActionData: _subscribeActionData,
    subscribeNewRun: _subscribeNewRun,
    setOutput: _setOutput
  };
})();

