import React, { useState, createRef, useRef } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native';
import { Block, Button, Text, theme } from 'galio-framework';
import argonTheme from "../constants/Theme";

import { Camera } from "expo-camera";
import { cameraWithTensors, bundleResourceIO } from "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import * as handpose from '@tensorflow-models/handpose';
import * as fp from "fingerpose"
import Handsigns from "../handsigns"


//import * as mobilenet from "@tensorflow-models/mobilenet";
import Canvas from 'react-native-canvas'; // 0.1.20

const TensorCamera = cameraWithTensors(Camera);
const {width, height} = Dimensions.get('window'); 

const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Infinity Gauntlet Style
const style = {
  0: { color: "yellow", size: 15 },
  1: { color: "gold", size: 7 },
  2: { color: "green", size: 10 },
  3: { color: "gold", size: 7 },
  4: { color: "gold", size: 7 },
  5: { color: "purple", size: 10 },
  6: { color: "gold", size: 6 },
  7: { color: "gold", size: 6 },
  8: { color: "gold", size: 6 },
  9: { color: "blue", size: 10 },
  10: { color: "gold", size: 6 },
  11: { color: "gold", size: 6 },
  12: { color: "gold", size: 6 },
  13: { color: "red", size: 10 },
  14: { color: "gold", size: 6 },
  15: { color: "gold", size: 6 },
  16: { color: "gold", size: 6 },
  17: { color: "orange", size: 10 },
  18: { color: "gold", size: 6 },
  19: { color: "gold", size: 6 },
  20: { color: "gold", size: 6 },
};

const styles = StyleSheet.create({
  camera: {
    height: '92%',
    width: '100%',
    // flex: 1
  },
  text:{
    textAlign:'center',
    marginTop: 2
  },
  canvas:{
          position:'absolute',
          zIndex: 10000000,
          width: '100%',
          height: '92%'
}});


class Cameras extends React.Component {


  constructor(prop) {
    super(prop);
    this.name = "ican-camera";
    this.canvasRef = createRef();
    this.state = {
      isModelReady: false,
      useModel: {},
      model: null,
      count: 0,
      guess: ''
    };
  }

  init() {}

  async componentDidMount() {
    await tf.ready();
    // Signal to the app that tensorflow.js can now be used.
    // console.log("componentDidMount: tf.ready is set");
    // console.log("the MyModelLoadLocal component is mounted");
    const { status } = await Camera.requestCameraPermissionsAsync();
    // this.setState({cameraPermission: status === 'granted'});
    console.log("Start Loading Model");
    const model = await handpose.load();
    this.setState({ isModelReady: true, model });
    console.log("Model Loaded");
  }

  
  makeHandleCameraStream() {
    return (images, updatePreview, gl) => {
      const loop = async () => {
          const nextImageTensor = images.next().value;
          // const predictions = await this.state.model.estimateHands(nextImageTensor);
          if (!nextImageTensor)
            console.log("Image Error");

          this.canvasRef.current.width = width;
          this.canvasRef.current.height = height;
          const predictions = await this.state.model.estimateHands(nextImageTensor);
          this.setState({predictions})
          if (predictions.length > 0) {
            //loading the fingerpose model
            const GE = new fp.GestureEstimator([
              fp.Gestures.ThumbsUpGesture,
              Handsigns.aSign,
              Handsigns.bSign,
              Handsigns.cSign,
              Handsigns.dSign,
              Handsigns.eSign,
              Handsigns.fSign,
              Handsigns.gSign,
              Handsigns.hSign,
              Handsigns.iSign,
              Handsigns.jSign,
              Handsigns.kSign,
              Handsigns.lSign,
              Handsigns.mSign,
              Handsigns.nSign,
              Handsigns.oSign,
              Handsigns.pSign,
              Handsigns.qSign,
              Handsigns.rSign,
              Handsigns.sSign,
              Handsigns.tSign,
              Handsigns.uSign,
              Handsigns.vSign,
              Handsigns.wSign,
              Handsigns.xSign,
              Handsigns.ySign,
              Handsigns.zSign,
            ])
            const estimatedGestures = await GE.estimate(predictions[0].landmarks, 6.5)
            // console.log(estimatedGestures.gestures)
            const confidence = estimatedGestures.gestures.map(p => p.score)
            const maxConfidence = confidence.indexOf(
              Math.max.apply(undefined, confidence)
            )
            // console.log("Max:",maxConfidence);
            if (estimatedGestures.gestures.length > 0 && maxConfidence >=0 ){
              console.log("Guess:",estimatedGestures.gestures[maxConfidence].name);
              this.state.guess = estimatedGestures.gestures[maxConfidence].name;
            }
          }
          else {
            this.state.guess = "";
          }

          const ctx = this.canvasRef.current.getContext("2d");
          // requestAnimationFrame(loop);
          this.drawHand(predictions, ctx);
          this.state.count +=1;
          // console.log(this.state.count);
          if (this.state.count < 2000) requestAnimationFrame(loop);
      };
      loop();
    };
  }

  drawHand(predicts, context) {
    if (predicts.length > 0) {
      predicts.forEach((prediction) => {
        const landmarks = prediction.landmarks;
        for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
          let finger = Object.keys(fingerJoints)[j];
          for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
            const firstJointIndex = fingerJoints[finger][k];
            const secondJointIndex = fingerJoints[finger][k + 1];
  
            // Draw path
            context.beginPath();
            context.moveTo(
              landmarks[firstJointIndex][0],
              landmarks[firstJointIndex][1]
            );
            context.lineTo(
              landmarks[secondJointIndex][0],
              landmarks[secondJointIndex][1]
            );
            context.strokeStyle = "plum";
            context.lineWidth = 4;
            context.stroke();
          }
        }
  
        // Loop through landmarks and draw em
        for (let i = 0; i < landmarks.length; i++) {
          const x = landmarks[i][0];
          const y = landmarks[i][1];
          context.beginPath();
          context.arc(x, y, 5, 0, 3 * Math.PI);
          context.fillStyle = 'blue';
          context.fill();
        }
      });
    }
  }


  render() {
    let textureDims;
    if (Platform.OS === "ios") {
      textureDims = {
        height: 1920,
        width: 1080,
      };
    } else {
      textureDims = {
        height: 1200,
        width: 1600,
      };
    }

    return (
      <View>
        {this.state.model && (
          <TensorCamera
            // Standard Camera props
            style={styles.camera}
            type={Camera.Constants.Type.front}
            // Tensor related props
            cameraTextureHeight={textureDims.height}
            cameraTextureWidth={textureDims.width}
            resizeHeight={320}
            resizeWidth={240}
            resizeDepth={3}
            onReady={this.makeHandleCameraStream()}
            autorender={true}
            useCustomShadersToResize={false}
          />
        )}
        <Canvas style={styles.canvas}  ref = {this.canvasRef}/>
        <Text h5 style={styles.text} color={argonTheme.COLORS.SUCCESS}>{this.state.guess}</Text>

        {/* <Text bold color={theme.COLORS.BLACK}>{this.state.guess}</Text> */}

      </View>
    );
  }
}

export default Cameras;










// import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
// import React, { useState, useEffect, useRef } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, Platform, Dimensions, LogBox } from 'react-native';
// import { Camera, CameraType } from 'expo-camera';
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import * as tf from '@tensorflow/tfjs';
// import {Canvas} from 'react-native-canvas';

// const TensorCamera = cameraWithTensors(Camera);
// const {width, height} = Dimensions.get('window'); 

// LogBox.ignoreAllLogs(true);
// export default function Cameras() {
//   const [hasPermission, setHasPermission] = useState(null);
//   const {model, setModel} = useState<cocoSsd.ObjectDetection>(null);
//   let context = useRef(null);
//   let canvas = useRef<Canvas>(null);

// //   const [type, setType] = useState(CameraType.back);

//   useEffect(() => {
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       setHasPermission(status === 'granted');
//       await tf.ready();
//       setModel(await cocoSsd.load());
//       context = CanvasRenderingContext2D(); 
//     })();
//   }, []);

//   if (hasPermission === null) {
//     return <View />;
//   }
//   if (hasPermission === false) {
//     return <Text>No access to camera</Text>;
//   }

//   let textureDims = Platform.OS == 'ios' ? {height:1920,width:1080} : {height:1200, width:1600}

//   function handleCameraStream(img) {
//       const loop = async() => {
//           const nextImage = img.next().value;
//           if (!model || !nextImage)
//             throw new Error("Image Error");
//           model.detect(nextImage).then((prediction)=>{
//               draw(prediction,nextImage)

//           }).catch((err)=>{
//             console.log(err);
//           });

//           requestAnimationFrame(loop);

//       };
//       loop();
//   }

//   function draw(prediction,nextImage ){

//     const scaleWidth = width/ nextImage.shape[1];
//     const scaleHeight = height/nextImage.shape[0];

//     const flipHorizontal = Platform.OS == 'ios' ? false:true;
//     context.current.clearRect(0,0,width,height);

//     for (const pre of prediction){
//         const [x,y,width,height] = pre.bbox;
        
//         const boundingBoxX = flipHorizontal ? canvas.current.width - x * scaleWidth - width * scaleWidth : x * scaleWidth;
//         const boundingBoxY = y * scaleHeight;

//         context.current.strokeRect( boundingBoxX, boundingBoxY, width*scaleWidth, height*scaleHeight);

//         context.current.strokeText(pre.class, boundingBoxX-5, boundingBoxY-5);


//     }

//   }
//   async  function handleCanvas(can) {
//       if (can) {
//           can.width = width;
//           can.height = height;
//           const ctx = can.getContext('2d');
//           ctx.strokeStyle = 'red';
//           ctx.fillStyle = 'red';
//           ctx.lineWidth = 3;

//           context.current = ctx;
//           canvas.current = can;

//       }

//   }

//   return (
//     <View style={styles.container}>
//       <TensorCamera style={styles.camera} 
//        type={CameraType.front}
//        cameraTextureHeight={textureDims.height}
//        cameraTextureWidth={textureDims.width}
//        resizeHeight={200}
//        resizeWidth={120}
//        resizeDepth={3}
//        onReady={handleCameraStream}
//        autorender={true}
//        useCustomShadersToResize={false}
//       />
//       <Canvas style={styles.canvas} ref={handleCanvas}  />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//     width:'100%',
//     height:'100%',
//   },
//   buttonContainer: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     flexDirection: 'row',
//     margin: 20,
//   },
//   button: {
//     flex: 0.1,
//     alignSelf: 'flex-end',
//     alignItems: 'center',
//   },
//   text: {
//     fontSize: 18,
//     color: 'white',
//   },
//   canvas:{
//       position:'absolute',
//       zIndex: 10000000,
//       width: '100%',
//       height: '100%'
//   }
// });
