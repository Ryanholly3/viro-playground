'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
  ViroARScene,
  ViroOrbitCamera,
  ViroARPlane,
  ViroBox,
  ViroMaterials,
  ViroText,
  ViroConstants,
  ViroAnimations,
} from 'react-viro';

export default class HelloWorldSceneAR extends Component {

  constructor() {
    super();

    // Set initial state here
    this.state = {
      text : "Initializing AR..."
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
  }

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        <ViroOrbitCamera position={[0, 0, 0]} focalPoint={[0, 0, -1]} active={true} />
        <ViroBox
          position={[0, 0, -1]}
          scale={[0.2, 0.2, 0.2]}
          materials={["grid"]}
          animation={{name:'animateImage',
                      run:true,
                      loop:true
                    }}
          onClick={this._onClick}
        />
      </ViroARScene>
    );
  }

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "Hello World!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  latLongToDistanceAway(lat1, lat2, long1, long2){
    var radiusEarth = 6371e3;

    var lat1r = (lat1 * Math.PI)/180
    var lat2r = (lat2 * Math.PI)/180
    var dlat = (lat2 - lat1) * Math.PI / 180
    var dlong = (long2 - long1) * Math.PI / 180

    var a = Math.sin(dlat/2) * Math.sin(dlat/2) + Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(dlong/2) * Math.sin(dlong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = radiusEarth * c
    return d
  }

  _onClick = () => {
    var answer = this.latLongToDistanceAway(33.4484, 39.7392, 112.0740, 104.9903)
    alert(answer)
  }


  _onHover = (isHovering, source) =>{
    if(isHovering){
      alert('you are hovering!')
    } else {
      alert('you are no longer hovering')
    }
  }

  _onRotate = (rotateState) =>{
    if (rotateState === 3){
      alert('you are rotating!')
    }
  }
}

ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require('./res/PictureOfMe.jpg'),
  },
});

ViroMaterials.createMaterials({
  blueColor: {
    diffuseColor: "#0000FF"
  },
});

ViroAnimations.registerAnimations({
    animateImage:{properties:{rotateY:"+=360"},
                  duration: 4000},
    animateColor:{properties:{material:"blueColor"}, duration:3000},
    rotateAndColor:[["animateImage"], ["animateColor"]]

});


var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

module.exports = HelloWorldSceneAR;
