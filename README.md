# pose

## Inspiration

I was inspired by the british game show ["Hole in the Wall"](<https://en.wikipedia.org/wiki/Hole_in_the_Wall_(British_game_show)>) which I watched when I was growing up. When watching it I often found myself thinking it would be so easy if i could try it myself.

## What it does

The game, put simply lets users score points by contorting their body to get through the gaps as a obstacle hurtles towards them.

## How we built it

Going into the project I knew that i would need a framework. I chose to use Vue.js as i have lots of experience using it. Paired with the Component library Element UI, rapid prototyping was effortless as i could easily leverage existing components without having to worry about making my own.

The graphics for the game were controlled with Three.js. Where possible I reused materials and geometries to keep performance up. that was a vital consideration as performance was a constant consideration as inference on the pose model was very computationally intensive.

For pose Estimation, at first I used the keypoints from outputted from the [Teachable Machine Pose](https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose) library. This however proved to not be either accurate enough or performant enough (I was only getting about 15 frames per second with this model). Switching over to using `BlazePose` from [tensorflowjs](https://js.tensorflow.org/) allowed me to get up to 45 frames per second.

## Challenges we ran into

- Collision detection.
  This was an essential part of the game but since Three js doesn't support it out of the box, I had to make it myself. I considered adding a physics engine like [Oimo.js](https://github.com/lo-th/Oimo.js/) but I feared this would impact too much on performance. In the end my approach was to convert encode the user's position and the current obstacle as a SVG. Then using [kld-intersections](https://github.com/thelonious/kld-intersections) I could check for intersections between the user's points and the obstacle
- Color and aethstetics Graphic design has never been my forte. In fact I seem to have the uncanny ability to create a garish color scheme without even trying! I addressed this issue by sticking rigidly to a color palettes from `nice-color-palettes`. This largely worked allowing me to not have to think about the color scheme much.

## Accomplishments that we're proud of

I am really pleased with how the character design came out. Initially I thought about rigging a 3D model and mapping the keypoints from Blazenet to it.I'm glad i left it minimalistic as this helps keep the game looking playful plus it leaves open the option for more interesting level designs

## What we learned

I really learned about shaders. Although the shaders I used were quite simple, being new to the technology it took a lot of work to make them. I was definitely pleasantly surprised at how much mathematics was involved - this project makes me excited to explore them further

## What's next for Pose Game

I hope to add polish by adding generative music using tone.js, changes as the player moves. the game already makes you feel like moving around your space and i think music would only encourage this.

I am also excited to improve the levels by both adding more and improving the existing ones. I didn't have much of an idea of scale when I built the existing ones which makes it fiendishly challenging.

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```
