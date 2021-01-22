[![](https://data.jsdelivr.com/v1/package/npm/fab-window/badge)](https://www.jsdelivr.com/package/npm/fab-window)
# FabModal

FabModal it's a light, simply, modern and nice modal plugin in full JS native ! :wink:

Don't hesitate to contribute, for debug, upgrade, or more features ! 

Check the [contribute](#contribute) part for this.

## Get Started
###### Install

``` bash
# NPM
npm i fabmodal --save

# or YARN

yarn add fabmodal

# or CDN

// JavaScript
https://cdn.jsdelivr.net/npm/fab-window@1.1.0/src/js/FabModal.min.js

// CSS
https://cdn.jsdelivr.net/npm/fab-window@1.1.0/src/assets/css/main.min.css

// ICONS
https://cdn.jsdelivr.net/npm/fab-window@1.1.0/src/assets/icon/close.svg
https://cdn.jsdelivr.net/npm/fab-window@1.1.0/src/assets/icon/expand.svg
https://cdn.jsdelivr.net/npm/fab-window@1.1.0/src/assets/icon/minus.svg

```

###### Import script
**Classic**
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FabModal.js</title>
    <!-- FabModal -->
    <script src="./node_modules/FabModal/src/js/FabModal.js"></script>
</head>
```

**Module**

```js
import FabModal from 'FabModal';
```

###### Use

```js
let myModal = new FabModal({
    title: 'My modal !',
    content: 'My custom content'
});
// For start progress bar who closing modal when timeout ending
myModal.startProgress(6000);
// And more..
```

## Contribute

For contribute, it's easy, but we must first establish some rules :

**About code**
- Project **use ES5** js syntaxe, no compiler like webpack or other, please don't use ES6 syntaxe, for compatibility reasons (*for now*).
- Please use **simply** and **clearly** names for functions or variables.






