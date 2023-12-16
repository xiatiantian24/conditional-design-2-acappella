let video;
let poseNet;
let pose;
let skeleton;
let w = window.innerWidth;
let h = window.innerHeight;
let triggers;

let images = []; // An array to store the images
let sounds = [];
let gifs = [];

let catImage = {display:false};
let dogImage = {display:false};
let ratImage = {display:false};
let frogImage = {display:false};

let overlayOpacity = 100; // Opacity of the overlay
let gameStarted = false;

let showInstruction2 = false;
let instruction2StartTime;
let overlayTextHideTime;

let startAngle = 0;
let rotationSpeed;
let lastTime = 0;
let timerRunning = false; // Timer is initially off
let soundPlaying = false;

let mic, recorder, soundFile;
let state = 0;


// Text to display
let overlayText = "Turn up your camera & sound \nand wave your arms to play";
let overlayText2 = "Pet with multiple parts of \nyour body to let them sing together";

let scaleFactor = 1.5

function preload() {
  // Load the image from the local project directory
  images[0] = loadImage('cat1.png');
  images[1] = loadImage('cat2.png');
  images[2] = loadImage('dog1.png');
  images[3] = loadImage('dog2.png');
  images[4] = loadImage('rat1.png');
  images[5] = loadImage('rat2.png');
  images[6] = loadImage('frog1.png');
  images[7] = loadImage('frog2.png');
  images[8] = loadImage('lhand1.png');
  images[9] = loadImage('lhand2.png');
  images[10] = loadImage('lhand3.png');
  images[11] = loadImage('rhand1.png');
  images[12] = loadImage('rhand2.png');
  images[13] = loadImage('rhand3.png');

   // Load the voice recording
  sounds[0] = loadSound('1-b.wav'); 
  sounds[1] = loadSound('1-ba.wav');
  sounds[2] = loadSound('1-du.wav');
  sounds[3] = loadSound('1-na.wav');
  
  gifs[0] = loadImage('dancingshark.gif');
  gifs[1] = loadImage('dancinglink.gif');
  gifs[2] = loadImage('dancingspongebob.gif');
  gifs[3] = loadImage('dancelighttop.gif');
  gifs[4] = loadImage('dancelightbottom.gif');
}

function setup() {
  createCanvas(960, 720);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotCat);
  poseNet.on('pose', gotDog);
  poseNet.on('pose', gotRat);
  poseNet.on('pose', gotFrog);
  
    angleMode(RADIANS);
  rotationSpeed = TWO_PI / 9600.5; // One full rotation every sound

}

//TO-DO: add instructions to use two hands/head/feet at the same time some time after the game starts

//TO-DO: switch sounds/songs

//TO-DO: recording feature maybe?

function triggerPose(pose,imgX,imgWidth,imgY,imgHeight){
  let isTrigger = (
      pose.x > imgX &&
      pose.x < imgX + imgWidth &&
      pose.y > imgY &&
      pose.y < imgY + imgHeight
    )
  return isTrigger;
}

function trigger(poses, animal, imgX,imgWidth,imgY,imgHeight){
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;

    let wristR = pose.rightWrist;
    let wristL = pose.leftWrist;
    let ankleR=pose.rightAnkle;
    let ankleL=pose.leftAnkle;
    let earR=pose.rightEar;
    let earL=pose.leftEar;
    
    let isWristR = triggerPose(wristR, imgX,imgWidth,imgY,imgHeight);
    let isWristL = triggerPose(wristL, imgX,imgWidth,imgY,imgHeight);
    let isAnkleR = triggerPose(ankleR, imgX,imgWidth,imgY,imgHeight);
    let isAnkleL = triggerPose(ankleL, imgX,imgWidth,imgY,imgHeight);
    let isEarR = triggerPose(earR, imgX,imgWidth,imgY,imgHeight);
    let isEarL = triggerPose(earL, imgX,imgWidth,imgY,imgHeight);
    
    if(isWristR || isWristL || isAnkleR || isAnkleL ||isEarR || isEarL){
      animal.display = true;
      gameStarted = true;
    }
    else{
      animal.display = false;
    }
  }
}

function gotCat(poses) {
  trigger(poses,catImage, 10,200,290,250);              
}

function gotDog(poses) {
  trigger(poses,dogImage, 490,200,280,250);              
}

function gotRat(poses) {
  trigger(poses,ratImage, 0,170,0,180);          
}

function gotFrog(poses) {
  trigger(poses,frogImage, 380, 150, 0,130);
}

function modelLoaded() {
  // console.log('poseNet ready');
}

function draw() {
  // Mirror video
  // push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  // pop();
  
  // Add overlay with opacity
  blendMode(BLEND);
  fill(0, 0, 0, overlayOpacity);
  rect(0, 0, width, height);
  
  if (gameStarted){
   if (overlayOpacity > 0) {
    overlayOpacity -=5
   }else {
    if (overlayTextHideTime === undefined) {
      overlayTextHideTime = millis(); // Set the time when overlayText became hidden
    }
   }
  }
  
  // Display text on top of the overlay
  if (overlayOpacity > 0) {
    push();
    scale(-1,1);
    textSize(36);
    let textColor = color(255);
    fill(textColor);
    textAlign(CENTER, CENTER); // Center the text both horizontally and vertically
    text(overlayText, -width / 2, height / 2); // Position the text at the center
    pop();
   
  }
  
 if (overlayTextHideTime !== undefined && !showInstruction2) {
    let elapsedTime = millis() - overlayTextHideTime;
    
    // Display "instruction2" 4 seconds after overlayTextHideTime
    if (elapsedTime >= 4000) {
      push();
       scale(-1,1);
    textSize(36);
    let textColor = color(255);
    fill(textColor);
      textAlign(CENTER, CENTER);
      text(overlayText2, -width / 2, height / 2);
      pop();
      
      
      if (elapsedTime >= 9000) {
        overlayTextHideTime = undefined;
        showInstruction2 = true;
      }
    }
  }

  
  
    if (pose) {
    let eyeR=pose.rightEye;
    let eyeL=pose.leftEye;
    let earR=pose.rightEar;
    let earL=pose.leftEar;
    let nose=pose.nose;
    let shoulderR=pose.rightShoulder;
    let shoulderL=pose.leftShoulder;
    let elbowR=pose.rightElbow;
    let elbowL=pose.leftElbow;
    let wristR=pose.rightWrist;
    let wristL=pose.leftWrist;
    let hipR=pose.rightHip;
    let hipL=pose.leftHip;
    let kneeR=pose.rightKnee;
    let kneeL=pose.leftKnee;
    let ankleR=pose.rightAnkle;
    let ankleL=pose.leftAnkle;
    
    let d=dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
      
    image(images[11],wristR.x *scaleFactor -100, wristR.y *scaleFactor -50, 200, 140);
    image(images[8],wristL.x *scaleFactor -100, wristL.y *scaleFactor -50, 200, 140);
      
//        // Display Pose Points
//     for (let i = 0; i < pose.keypoints.length; i++) {
//       let x = (pose.keypoints[i].position.x)*scaleFactor;
//       let y = (pose.keypoints[i].position.y)*scaleFactor;
//       fill(255,255,255);
//       ellipse(x,y,10,10);
//     }
    
//    // Display Skeleton
//     for (let i = 0; i < skeleton.length; i++) {
//       let a = skeleton[i][0];
//       let b = skeleton[i][1];
//       strokeWeight(2);
//       stroke(255);
//       line(a.position.x *scaleFactor, a.position.y *scaleFactor,b.position.x *scaleFactor,b.position.y *scaleFactor);      
//     }
      
  }  
  
  // Display images based on the catImage variable
  if (catImage.display) {
    image(images[1], 40 *scaleFactor, 310 *scaleFactor, 200, 240);
    if(!sounds[0].isPlaying()){
      sounds[0].loop();
      startTimer();
    
      if(sounds[1].isPlaying()){
        sounds[1].jump(0);
      }
      if(sounds[2].isPlaying()){
        sounds[2].jump(0);
      }
      if(sounds[3].isPlaying()){
        sounds[3].jump(0);
      }
    }
  } else {
    image(images[0], 40 *scaleFactor, 310 *scaleFactor, 200, 240);
    sounds[0].stop();
  }
  
  if (dogImage.display) {
    image(images[3], 480 *scaleFactor, 300 *scaleFactor, 200, 220);
    if(!sounds[1].isPlaying()){
      sounds[1].loop();
      startTimer();
      
      if(sounds[0].isPlaying()){
        sounds[0].jump(0);
      }
      if(sounds[2].isPlaying()){
        sounds[2].jump(0);
      }
      if(sounds[3].isPlaying()){
        sounds[3].jump(0);
      }
    }
  } else {
    image(images[2], 480 *scaleFactor, 300 *scaleFactor, 200, 240);
    sounds[1].stop();
  }
  
  if (ratImage.display) {
    image(images[5], 10 *scaleFactor, 50 *scaleFactor, 220, 240);
    if(!sounds[2].isPlaying()){
      sounds[2].loop();
      startTimer();
    
      if(sounds[1].isPlaying()){
        sounds[1].jump(0);
      }
      if(sounds[0].isPlaying()){
        sounds[0].jump(0);
      }
      if(sounds[3].isPlaying()){
        sounds[3].jump(0);
      }
    }
  } else {
    image(images[4], 10 *scaleFactor, 50 *scaleFactor, 220, 240);
    sounds[2].stop();
  }
  
    if (frogImage.display) {
    image(images[7], 400 *scaleFactor, 10 *scaleFactor, 210, 230);
    if(!sounds[3].isPlaying()){
      sounds[3].loop();
      startTimer();
     
      if(sounds[1].isPlaying()){
        sounds[1].jump(0);
      }
      if(sounds[2].isPlaying()){
        sounds[2].jump(0);
      }
      if(sounds[0].isPlaying()){
        sounds[0].jump(0);
      }
    }
  } else {
    image(images[6], 400 *scaleFactor, 10 *scaleFactor, 210, 230);
    sounds[3].stop();
  }
    
  //draw a timer
    if (timerRunning) {
    let thisTime = millis();
    let elapsedTime = thisTime - lastTime;
    lastTime = thisTime;
    startAngle += rotationSpeed * elapsedTime;
    fill(255);
    stroke(51);
    strokeWeight(10);
    arc(900, 50, 60, 60, 0, startAngle);
  } else{
    
  }
  
  //check if anything is playing
    if (sounds[0].isPlaying() || sounds[1].isPlaying() || sounds[2].isPlaying()  || sounds[3].isPlaying()) {
      timerRunning = true;
    } else {
      timerRunning = false;
    }
  
  
  //check if all things are playing
    if (sounds[0].isPlaying() && sounds[1].isPlaying() && sounds[2].isPlaying()  && sounds[3].isPlaying()) {
      image(gifs[0], 50 *scaleFactor, 200 *scaleFactor, 480, 270);
      image(gifs[1], 200 *scaleFactor, 250 *scaleFactor, 280, 180);
      image(gifs[2], 250 *scaleFactor, 200 *scaleFactor, 500, 290);
      // image(gifs[3], 250 *scaleFactor, 0 *scaleFactor, 110, 140);
      image(gifs[4], 150 *scaleFactor, 100 *scaleFactor, 480, 471);
    }
      
      
  // Add an event listener to the restart button   
  document.getElementById("restartButton").addEventListener("click", function() {
      // Reload the sketch when the button is clicked
      location.reload();
    });
  
  // Add a help popup
  const instructionsButton = document.getElementById('instructionsButton');
      const instructionsPopup = document.getElementById('instructionsPopup');
      const closeButton = document.getElementById('closeButton');

      instructionsButton.addEventListener('click', () => {
        instructionsPopup.style.display = 'block'; // Show the popup
      });

      // Click outside the popup to close it
      document.addEventListener('click', (event) => {
        if (event.target !== instructionsButton && event.target !== instructionsPopup) {
          instructionsPopup.style.display = 'none'; // Hide the popup
        }
      });

      // Close button event listener
      closeButton.addEventListener('click', () => {
        instructionsPopup.style.display = 'none'; // Hide the popup
      });
}

//restart timer
function startTimer() {
  startAngle = 0;
  timerRunning = true;
  lastTime = millis();
  loop();
}
