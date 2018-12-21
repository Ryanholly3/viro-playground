'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
  ViroARScene,
  ViroConstants,
  ViroParticleEmitter,
  ViroGeometry,
  ViroSphere,
  ViroText,
  ViroMaterials,
  ViroBox,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARPlaneSelector,
  ViroNode,
  ViroAnimations
} from 'react-viro';

export default class HelloWorldSceneAR extends Component {

  constructor() {
    super();

    // Set initial state here
    this.state = {
      text : "Initializing AR...",
      phoneLat: 0,
      phoneLong: 0,
      phoneHeading: 0,
      objLat: 39.757611,
      objLong: -105.006963,
      objX: 0,
      objY: 0,
      objZ: 0,
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
  }

  componentDidMount(){
    this.watchCoordinates()
  }
  //
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }


  render() {

    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        <ViroAmbientLight color="#FFFFFF" />
        <Viro3DObject source={require('./res/doctor_mario/scene.gltf')}
          type="GLTF"
          position={[this.state.objX, this.state.objY, this.state.objZ]}
          rotation={[0,0,0]}
          scale={[0.2, 0.2, 0.2]}
          onClick={this._onClick}
       />
      </ViroARScene>
    );
  }

  //CHEESE SANDIWCH
  // <Viro3DObject source={require('./res/egg_sandwich/scene.gltf')}
  //    resources={[require('./res/egg_sandwich/scene.bin'),
  //                require('./res/egg_sandwich/textures/Material_baseColor.png'),
  //                require('./res/egg_sandwich/textures/Material.000_baseColor.png'),
  //                require('./res/egg_sandwich/textures/Material.000_normal.png'),
  //                require('./res/egg_sandwich/textures/Material.001_baseColor.png')
  //              ]}
  //    type="GLTF"
  //    position={[0, 0, -4]}
  //    scale={[0.5, 0.5, 0.5]}
  // />

  //DOCTOR MARIO
  // <Viro3DObject source={require('./res/doctor_mario/scene.gltf')}
  //    type="GLTF"
  //    position={[0, -5, -10]}
  //    rotation={[0,0,0]}
  //    scale={[0.3, 0.3, 0.3]}
  // />

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "Hello World!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  latLongToDistanceAway = (lat1, long1, lat2, long2) =>{
    var radiusEarth = 6371e3;

    //convert degrees to radians
    var lat1r = (lat1 * Math.PI)/180
    var lat2r = (lat2 * Math.PI)/180

    //difference lat and difference long in radians
    var dlat = (lat2 - lat1) * Math.PI / 180
    var dlong = (long2 - long1) * Math.PI / 180

    var a = Math.sin(dlat/2) * Math.sin(dlat/2) + Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(dlong/2) * Math.sin(dlong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = radiusEarth * c
    return d
  }

  bearingPhoneToObj = (lat1, long1, lat2, long2) =>{
    //sum with heading to determine virtual angle from phone heading to obj

    //convert degrees to radians
    var lat1r = (lat1 * Math.PI)/180
    var lat2r = (lat2 * Math.PI)/180
    var long1r = (long1 * Math.PI)/180
    var long2r = (long2 * Math.PI)/180

    //difference in long in radians
    var dlong = (long2 - long1) * Math.PI / 180

    var y = Math.sin(dlong) * Math.cos(lat2r);
    var x = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dlong);
    var brng = (Math.atan2(y, x) * 180) / Math.PI
    //returned in degrees between -180 and +180
    return brng
  }

  _onClick = () => {
    var answer = this.bearingPhoneToObj(39.7575767, -105.0069728, 39.757611, -105.006963)
    alert(answer)
    // this.setState({
    //   pos: Math.random()*(-5)
    // })
  }

  watchCoordinates = () =>{
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.setState({
          phoneLat: position.coords.latitude,
          phonelong: position.coords.longitude,
        });

        this._mapVirtual(position.coords.latitude, position.coords.longitude, this.state.phoneHeading, this.state.objLat, this.state.objLong)
        // could pass position.coords.latitude,long,heading into this if dont want to wait for state to update
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000, distanceFilter: 1 },
    );
  }

  _mapVirtual = async (phoneLat, phoneLong, phoneHeading, objLat, objLong) => {
    let distBetweenPhoneObj = await this.latLongToDistanceAway(phoneLat, phoneLong, objLat, objLong)
    let headingPhoneToObj = await this.bearingPhoneToObj(phoneLat, phoneLong, objLat, objLong)

    //convert to 0-360 range, convert to radians
    let virtualDegrees360 = ((headingPhoneToObj - phoneHeading) + 360) % 360
    let virtualRadians = (virtualDegrees360 * Math.PI)/180

    let objZ = Math.cos(virtualRadians) * distBetweenPhoneObj
    let objX = Math.sin(virtualRadians) * distBetweenPhoneObj

    let display = `phoneLat: ${phoneLat}, phoneLong: ${phoneLong}, objLat: ${objLat}, objLong: ${objLong},
    distBetweenPhoneObj: ${distBetweenPhoneObj}, headingPhoneToObj: ${headingPhoneToObj}, virtualRadians: ${virtualRadians},
    objX: ${objX}, objZ: ${objZ}`
    alert(display)

    this.setState({
      objX: objX,
      objZ: objZ,
    })
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
