( function ($) {

  $.widget('popupescape.movie', {
    options: {
      src: "",
      screenName:"ghost",
      connection:false,
      width:"1080px",
      height:"1920px",
      debug: false
    },
    _movieHTML: {},

    _create: function(){
      this._createMovieHTML();
      var that = this;

      peConnect.subscribeActionData(function(data){that._parseActionData(data)})
      peConnect.subscribeNewRun(function(){that._reset()})
    },

    _createMovieHTML: function(){
      let video = $("<video>").attr({width:this.options.width, height:this.options.height, preload:"auto"});
      let source = $("<source>").attr({src:this.options.src})
      video.append(source);
      this._movieHTML = video[0];
      this.element.html(this._movieHTML);
    },

    _reset: function(){ 
      this._createMovieHTML();
    },

    _parseActionData: function(data){
      console.log(data)
      switch(data['action']){
        case "SEND":
          if(data['content']['movie']){
            if(data['content']['movie']['screen'] == this.options.screenName){
              if(data['content']['movie']['action'] == "PLAY"){
                if(this.options.debug)
                  console.log(this._movieHTML)

                this._movieHTML.play();
              }
            }
          }
      }
    },
  });
})(jQuery)

