/*
Developed by Astralsparv
astralsparv.neocities.org
*/

var JOYSTICK_DIV = null;

function __init_joystick_div() {
    if (JOYSTICK_DIV) return;

    JOYSTICK_DIV = document.createElement('div');
    var div_style = JOYSTICK_DIV.style;
    div_style.background = 'rgba(255,255,255,0)';
    div_style.position = 'absolute';
    div_style.top = '0';
    div_style.left = '0';
    div_style.width = '100%';
    div_style.height = '100%';
    div_style.margin = '0';
    div_style.padding = '0';
    div_style.borderWidth = '0';
    div_style.overflow = 'hidden';
    div_style.zIndex = '10000';
    div_style.pointerEvents = 'none';
    document.body.appendChild(JOYSTICK_DIV);
}

var JoyStick = function(attrs) {
    this.radius = attrs.radius || 50;
    this.inner_radius = attrs.inner_radius || this.radius / 2;

    this.id = attrs.id || "";
    this.x = attrs.x || 0;
    this.y = attrs.y || 0;
    this.mouse_support = attrs.mouse_support !== undefined ? attrs.mouse_support : true;

    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;

    this.normX = 0;
    this.normY = 0;

    this.active = false;

    if (!JOYSTICK_DIV) __init_joystick_div();
    this.div = JOYSTICK_DIV;

    this.__create_visuals();
    this.__bind_events();
};


JoyStick.prototype.__is_up = function(dx, dy) {
    return dy < 0 && Math.abs(dx) <= 2 * Math.abs(dy);
};
JoyStick.prototype.__is_down = function(dx, dy) {
    return dy > 0 && Math.abs(dx) <= 2 * Math.abs(dy);
};
JoyStick.prototype.__is_left = function(dx, dy) {
    return dx < 0 && Math.abs(dy) <= 2 * Math.abs(dx);
};
JoyStick.prototype.__is_right = function(dx, dy) {
    return dx > 0 && Math.abs(dy) <= 2 * Math.abs(dx);
};

JoyStick.prototype.__is_inside = function(px, py) {
    var dx = px - this.x;
    var dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
};
JoyStick.prototype.__create_visuals = function() {
    this.base = document.createElement('span');
    this.base.id = this.id;
    var s = this.base.style;
    s.pointerEvents = 'auto';
    s.width = this.radius * 2 + 'px';
    s.height = this.radius * 2 + 'px';
    s.position = 'fixed';
    if (this.id=="lJoystick"){
        s.left = '40px';
        s.bottom = '40px';
    }else{
        if (this.id=="rJoystick"){
            s.right = '40px';
            s.bottom = '40px';
        }
    }
    s.borderRadius = '50%';
    s.borderColor = 'rgba(200,200,200,0.5)';
    s.borderWidth = '1px';
    s.borderStyle = 'solid';
    this.div.appendChild(this.base);

    this.control = document.createElement('span');
    s = this.control.style;
    s.pointerEvents = 'auto';
    s.width = this.inner_radius * 2 + 'px';
    s.height = this.inner_radius * 2 + 'px';
    s.position = 'fixed';
    if (this.id=="lJoystick"){
        s.left = '40px';
        s.bottom = '40px';
    }else{
        if (this.id=="rJoystick"){
            s.right = '40px';
            s.bottom = '40px';
        }
    }
    s.borderRadius = '50%';
    s.backgroundColor = 'rgba(200,200,200,0.3)';
    s.borderWidth = '1px';
    s.borderColor = 'rgba(200,200,200,0.8)';
    s.borderStyle = 'solid';
    this.div.appendChild(this.control);
    this.updatePosition();
    window.addEventListener('resize', () => this.updatePosition());
};

JoyStick.prototype.updatePosition = function() {
    const rect = this.base.getBoundingClientRect();
    this.x = rect.left + rect.width / 2;  // center x
    this.y = rect.top + rect.height / 2;  // center y

    if (!this.active) {
        this.control.style.left = this.x - this.inner_radius + 'px';
        this.control.style.top  = this.y - this.inner_radius + 'px';
    }
};

JoyStick.prototype.__bind_events = function() {
    var self = this;

    function getXY(evt) {
        if (evt.changedTouches) {
            return {
                x: evt.changedTouches[0].clientX,
                y: evt.changedTouches[0].clientY
            };
        }
        return { x: evt.clientX, y: evt.clientY };
    }

    function touch_start(evt) {
        var pos = getXY(evt);
        if (!self.__is_inside(pos.x, pos.y)) return;
        self.active = true;
        touch_move(evt);
    }

    function touch_move(evt) {
        if (!self.active) return;

        var pos = getXY(evt);
        var dx = pos.x - self.x;
        var dy = pos.y - self.y;

        var maxDist = self.radius;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var clampedX = dx;
        var clampedY = dy;

        if (distance > maxDist) {
            var angle = Math.atan2(dy, dx);
            clampedX = Math.cos(angle) * maxDist;
            clampedY = Math.sin(angle) * maxDist;
        }

        self.control.style.left = self.x + clampedX - self.inner_radius + 'px';
        self.control.style.top = self.y + clampedY - self.inner_radius + 'px';

        self.normX = Math.max(-1, Math.min(1, dx / maxDist));
        self.normY = Math.max(-1, Math.min(1, dy / maxDist));

        self.up = self.__is_up(dx, dy);
        self.down = self.__is_down(dx, dy);
        self.left = self.__is_left(dx, dy);
        self.right = self.__is_right(dx, dy);

        if (typeof joystickUpdate === "function") {
            joystickUpdate(self.normX, self.normY, self.id);
        }
    }

    function touch_end(evt) {
        if (!self.active) return;
        self.active = false;

        self.left = self.right = self.up = self.down = false;
        self.normX = self.normY = 0;
        self.control.style.left = self.x - self.inner_radius + 'px';
        self.control.style.top = self.y - self.inner_radius + 'px';

        if (typeof joystickUpdate === "function") {
            joystickUpdate(self.normX, self.normY, self.id);
        }
    }

    document.addEventListener('touchstart', touch_start);
    document.addEventListener('touchmove', touch_move);
    document.addEventListener('touchend', touch_end);

    if (this.mouse_support) {
        document.addEventListener('mousedown', touch_start);
        document.addEventListener('mousemove', touch_move);
        document.addEventListener('mouseup', touch_end);
    }
};


const leftJoystick=true; // set to false for a DPAD
let addMobile=false;

let emulatedController;

const svgs={
    x:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" version="1.1" id="svg1"><defs id="defs1"/><g id="layer1"><circle style="fill:none;stroke:#ffffff;stroke-width:1.83267;stroke-dasharray:none;stroke-opacity:1" id="path1" cx="250" cy="-250" transform="scale(1,-1)" r="229.08366"/><path style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:2.75137;stroke-dasharray:none;stroke-opacity:1" d="M 100.93753,101.11798 399.06247,398.88202 Z" id="path3"/><path style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:2.75137;stroke-dasharray:none;stroke-opacity:1" d="M 398.88202,100.93753 101.11798,399.06247 Z" id="path3-8"/></g></svg>`,
    o:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" version="1.1" id="svg1"><defs id="defs1"/><g id="layer1"><circle style="fill:none;stroke:#ffffff;stroke-width:1.83267;stroke-dasharray:none;stroke-opacity:1" id="path1" cx="250" cy="-250" transform="scale(1,-1)" r="229.08366"/><circle style="fill:none;stroke:#ffffff;stroke-width:1.19523;stroke-dasharray:none;stroke-opacity:1" id="path1-5" cx="250" cy="-250" transform="scale(1,-1)" r="149.40239"/></g></svg>`,
    a:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" version="1.1" id="svg1"><defs id="defs1"/><g id="layer1"><circle style="fill:none;stroke:#ffffff;stroke-width:1.83267;stroke-dasharray:none;stroke-opacity:1" id="path1" cx="250" cy="-250" transform="scale(1,-1)" r="229.08366"/><path style="font-size:469.381px;font-family:Tahoma;-inkscape-font-specification:Tahoma;text-align:end;text-anchor:end;fill:none;stroke:#ffffff;stroke-width:2;stroke-dasharray:none" d="M 106.98547,392.35461 222.03882,51.090783 h 55.92235 L 393.01453,392.35461 h -47.9007 L 314.17318,297.0116 H 183.7641 l -30.94064,95.34301 z M 301.56774,258.2785 248.85405,97.387152 196.36955,258.2785 Z" id="text3" aria-label="A"/></g></svg>`,
    b:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" version="1.1" id="svg1"><defs id="defs1"/><g id="layer1"><circle style="fill:none;stroke:#ffffff;stroke-width:1.83267;stroke-dasharray:none;stroke-opacity:1" id="path1" cx="250" cy="-250" transform="scale(1,-1)" r="229.08366"/><path style="font-size:469.381px;font-family:Tahoma;-inkscape-font-specification:Tahoma;text-align:end;text-anchor:end;fill:none;stroke:#ffffff;stroke-width:2;stroke-dasharray:none" d="m 377.74092,315.89211 q 0,25.44009 -9.62597,44.92123 -9.62598,19.48115 -25.89847,32.08659 -19.25195,15.12654 -41.25419,21.54386 -22.00223,6.18813 -56.83911,6.18813 h -97.8641 V 79.368081 h 90.53003 q 36.4412,0 54.5472,2.521089 18.3352,2.2919 35.06607,11.230308 18.33519,9.855172 26.81522,25.898472 8.48003,15.8141 8.48003,37.35796 0,24.06494 -12.83464,43.08771 -12.60545,19.02276 -35.06606,29.79469 v 1.83352 q 30.48226,8.25084 47.21313,30.25307 16.73086,21.77305 16.73086,54.54721 z M 314.4845,162.79323 q 0,-12.37626 -4.12542,-21.31467 -4.12542,-9.1676 -13.29302,-14.43896 -11.00112,-6.18813 -24.52332,-7.56327 -13.52221,-1.37514 -37.35796,-1.37514 H 191.63869 V 218.028 h 51.56773 q 21.31467,0 31.39903,-2.06271 10.08435,-2.29189 20.85628,-9.16759 10.31355,-6.64651 14.66816,-17.41844 4.35461,-10.77193 4.35461,-26.58603 z m 16.04329,154.9324 q 0,-19.25195 -5.50055,-31.62821 -5.50056,-12.60545 -22.23143,-21.31467 -10.77193,-5.72975 -23.60656,-7.33407 -12.60545,-1.60433 -35.98283,-1.60433 h -51.56773 v 126.05447 h 36.89958 q 29.79469,0 46.98394,-2.75028 17.18924,-2.75028 30.25307,-11.68869 12.83464,-8.93841 18.79358,-20.16872 5.95893,-11.45949 5.95893,-29.5655 z" id="text3" aria-label="B"/></g></svg>`
};

document.body.ontouchstart=function(){
    if (addMobile) {return;}
    addMobile=true;
    const originalGetGamepads = navigator.getGamepads.bind(navigator);

    emulatedController = {
        id: "Astralsparv Gamepad",
        index: 0,
        connected: true,
        mapping: "standard",
        axes: [0,0,0,0],
        buttons: Array(17).fill().map(() => ({ pressed: false, value: 0 }))
    }
    navigator.getGamepads = function() {
        const gamepads=Array.from(originalGetGamepads() || []);
        //overwrite index 0 (player 0)
        gamepads[0] = emulatedController;
        return gamepads;
    }

    const container = document.createElement('div');
    container.id='astralsparv-container';

    if (leftJoystick){
        var lJoystick = new JoyStick({
            radius: 40,
            inner_radius: 40,
            mouse_support: true,
            id: "lJoystick"
        });
        lJoystick.base.style.bottom="5%";
        
        lJoystick.base.style.pointerEvents = 'auto';
        lJoystick.control.style.pointerEvents = 'auto';
        lJoystick.updatePosition();
    }else{
        const dpadDiv = document.createElement('div');
        dpadDiv.classList='dpad';
        dpadDiv.innerHTML='<div class="dpad"><div></div><div class="dpad-obj" style="border-left: 3px solid rgb(255,255,255);border-right: 3px solid rgb(255,255,255);border-top: 3px solid rgb(255,255,255);" onmousedown="axis(1,-1)" onmouseup="axis(1,0);" ontouchstart="axis(1,-1)" ontouchend="axis(1,0);"></div><div></div><div class="dpad-obj" style="border-left: 3px solid rgb(255,255,255);border-top: 3px solid rgb(255,255,255);border-bottom: 3px solid rgb(255,255,255);" onmousedown="axis(0,-1)" onmouseup="axis(0,0);" ontouchstart="axis(0,-1)" ontouchend="axis(0,0);"></div><div></div><div class="dpad-obj" style="border-right: 3px solid rgb(255,255,255);border-top: 3px solid rgb(255,255,255);border-bottom: 3px solid rgb(255,255,255);" onmousedown="axis(0,1)" onmouseup="axis(0,0);" ontouchstart="axis(0,1)" ontouchend="axis(0,0);"></div><div></div><div class="dpad-obj" style="border-left: 3px solid rgb(255,255,255);border-right: 3px solid rgb(255,255,255);border-bottom: 3px solid rgb(255,255,255);" onmousedown="axis(1,1)" onmouseup="axis(1,0);" ontouchstart="axis(1,1)" ontouchend="axis(1,0);"></div><div></div></div>';
        container.appendChild(dpadDiv);
    }
    var rJoystick = new JoyStick({
        radius: 40,
        inner_radius: 40,
        mouse_support: true,
        id: "rJoystick"
    });
    rJoystick.base.style.bottom="5%";
    rJoystick.base.style.pointerEvents = 'auto';
    rJoystick.control.style.pointerEvents = 'auto';
    rJoystick.updatePosition();
    const x=document.createElement('img');
    x.classList="astralsparv-button";
    x.src="data:image/svg+xml;utf8," + encodeURIComponent(svgs["x"]);
    x.onmousedown=function(t){t.preventDefault();button(0,1)};
    x.onmouseup=function(t){t.preventDefault(); button(0,0)};
    x.ontouchstart=function(t){t.preventDefault(); button(0,1)};
    x.ontouchend=function(t){t.preventDefault(); button(0,0)};
    x.style.position='fixed';
    x.style.right='30vmin';
    x.style.top='17vmin';
    container.appendChild(x);
    const o=document.createElement('img');
    o.classList="astralsparv-button";
    o.src="data:image/svg+xml;utf8," + encodeURIComponent(svgs["o"]);
    o.onmousedown=function(t){t.preventDefault(); button(1,1)};
    o.onmouseup=function(t){t.preventDefault(); button(1,0)};
    o.ontouchstart=function(t){t.preventDefault(); button(1,1)};
    o.ontouchend=function(t){t.preventDefault(); button(1,0)};
    o.style.right='17vmin';
    o.style.top='30vmin';
    container.appendChild(o);
    const a=document.createElement('img');
    a.classList="astralsparv-button";
    a.src="data:image/svg+xml;utf8," + encodeURIComponent(svgs["a"]);
    a.onmousedown=function(t){t.preventDefault(); button(3,1)};
    a.onmouseup=function(t){t.preventDefault(); button(3,0)};
    a.ontouchstart=function(t){t.preventDefault(); button(3,1)};
    a.ontouchend=function(t){t.preventDefault(); button(3,0)};
    a.style.right='17vmin';
    a.style.top='5vmin';
    container.appendChild(a);
    const b=document.createElement('img');
    b.classList="astralsparv-button";
    b.src="data:image/svg+xml;utf8," + encodeURIComponent(svgs["b"]);
    b.onmousedown=function(t){t.preventDefault(); button(2,1)};
    b.onmouseup=function(t){t.preventDefault(); button(2,0)};
    b.ontouchstart=function(t){t.preventDefault(); button(2,1)};
    b.ontouchend=function(t){t.preventDefault(); button(2,0)};
    b.style.right='5vmin';
    b.style.top='17vmin';
    container.appendChild(b);
    const style = document.createElement('style');
    style.innerHTML='.astralsparv-button{width: 13vmin; position: fixed;} .dpad{position: fixed; left: 5vmin; bottom: 25vmin; display: grid;grid-template-columns: repeat(3,0.01fr); z-index: 10001; height: 150px;} .dpad div{width: 7vmin;height: 7vmin;}; body,html{overflow-y:none;}';
    document.head.appendChild(style);
    document.body.appendChild(container);

    const e=document.getElementById('p8_playarea').children[1]
    e.style.position='fixed';
    e.style.left='0';
    e.style.top='0';
    e.style.padding='0';
}

function joystickUpdate(x,y,id){
    if (id=="lJoystick"){
        emulatedController.axes[0]=x;
        emulatedController.axes[1]=y;
    }else{
        if (id=="rJoystick"){
            emulatedController.axes[2]=x;
            emulatedController.axes[3]=y;
        }
    }
}

function axis(i,f){
    emulatedController.axes[i]=f;
}

function button(i,f){
    emulatedController.buttons[i]={pressed:(f==1), value: f};
}

function handleStartPress(e){
    for (i=0; i<e.inputs.axes.length; i++){
        if (e.inputs.axes[i]!=0){
            emulatedController.axes[i]=e.inputs.axes[i];
        }
    }
    if (e.inputs.x!=0){ emulatedController.buttons[0]={pressed:true, value:e.inputs.x } }
    if (e.inputs.z!=0){ emulatedController.buttons[1]={pressed:true, value:e.inputs.z } }
    if (e.inputs.a!=0){ emulatedController.buttons[2]={pressed:true, value:e.inputs.a } }
    if (e.inputs.b!=0){ emulatedController.buttons[3]={pressed:true, value:e.inputs.b } }
}

function handleEndPress(e){
    for (i=0; i<e.inputs.axes.length; i++){
        if (e.inputs.axes[i]!=0){
            emulatedController.axes[i]=0;
        }
    }
    if (e.inputs.x!=0){ emulatedController.buttons[0]={pressed:false, value:0 } }
    if (e.inputs.z!=0){ emulatedController.buttons[1]={pressed:false, value:0 } }
    if (e.inputs.a!=0){ emulatedController.buttons[2]={pressed:false, value:0 } }
    if (e.inputs.b!=0){ emulatedController.buttons[3]={pressed:false, value:0 } }
    if (e.inputs.start!=0){ emulatedController.buttons[4]={pressed:false, value:0 } }
}

function pico8_buttons_event(){return;} // remove pico 8 button functionality

function p8_update_layout()
{
    var canvas = document.getElementById("canvas");
    var p8_playarea = document.getElementById("p8_playarea");
    var p8_container = document.getElementById("p8_container");
    var p8_frame = document.getElementById("p8_frame");
    var csize = 480;
    var margin_top = 0;
    var margin_left = 0;

    p8_playarea.style.display="table";

    // page didn't load yet? first call should be after p8_frame is created so that layout doesn't jump around.
    if (!canvas || !p8_playarea || !p8_container || !p8_frame)
    {
        requestAnimationFrame(p8_update_layout);
        return;
    }

    // assumes frame doesn't have padding
    
    var is_fullscreen=(document.fullscreenElement || document.mozFullScreenElement || document.webkitIsFullScreen || document.msFullscreenElement);
    var frame_width = p8_frame.offsetWidth;
    var frame_height = p8_frame.offsetHeight;

    if (is_fullscreen)
    {
        // same as window
        frame_width = window.innerWidth;
        frame_height = window.innerHeight;
    }
    else{
        // never larger than window  // (happens when address bar is down in portraight mode on phone)
        frame_width  = Math.min(frame_width, window.innerWidth);
        frame_height = Math.min(frame_height, window.innerHeight);
    }

    // as big as will fit in a frame..
    
    let scale = 2;
    while (scale < 8 &&  (270 * scale) <= frame_height && (480 * scale) <= frame_width)
        scale ++;
    scale --;

    csize = 480 * scale;
    csize_y = 270 * scale;

//		console.log("csize: "+csize+"   frame_width: "+frame_width+"   frame_height: "+frame_height);

    // .. but never more than 2/3 of longest side for touch (e.g. leave space for controls on iPad)
    if (p8_touch_detected && p8_is_running)
    {
        var longest_side = Math.max(window.innerWidth,window.innerHeight);
        csize = Math.min(csize, longest_side * 2/3);
    }


    // pixel perfect: quantize to closest multiple of 128
    // only when large display (desktop)
/*
    if (frame_width >= 480 && frame_height >= 270)
    {
        csize = (csize+1) & ~0x7f;
    }
*/

    if (!addMobile){
        if (is_fullscreen){
            {
                // always center horizontally
                margin_left = (frame_width - csize)/2;

                if (p8_touch_detected)
                {
                    if (window.innerWidth < window.innerHeight)
                    {
                        // portrait: keep at y=40 (avoid rounded top corners / camer num thing etc.)
                        margin_top = Math.min(40, frame_height - csize_y);
                    }
                    else
                    {
                        // landscape: put a little above vertical center
                        margin_top = (frame_height - csize_y)/4;
                    }
                }
                else{
                    // non-touch: center vertically
                    margin_top = (frame_height - csize_y)/2;
                }
            }
        }

        // center vertically
        margin_top = (frame_height - csize_y)/2;
    }

    // mobile in portrait mode: put screen at top (w / a little space for fullscreen button)
    // (don't cart about buttons overlapping screen)
    if (p8_touch_detected && p8_is_running && document.body.clientWidth < document.body.clientHeight)
        p8_playarea.style.marginTop = 32;
    else if (p8_touch_detected && p8_is_running) // landscape: slightly above vertical center (only relevant for iPad / highres devices)
        p8_playarea.style.marginTop = (document.body.clientHeight - csize_y) / 4;
    else
        p8_playarea.style.marginTop = "";

    canvas.style.width = csize;
    canvas.style.height = csize_y;

    // to do: this should just happen from css layout
    canvas.style.marginLeft = margin_left;
    canvas.style.marginTop = margin_top;

    p8_container.style.width = csize;
    p8_container.style.height = csize_y;

    // set menu buttons position to bottom right
    el = document.getElementById("menu_buttons");
    el.style.marginTop = csize_y - el.offsetHeight;

    if (p8_touch_detected && p8_is_running)
    {
        // turn off pointer events to prevent double-tap zoom etc (works on Android)
        // don't want this for desktop because breaks mouse input & click-to-focus when using codo_textarea
        canvas.style.pointerEvents = "none";

        p8_container.style.marginTop = "0px";

        // buttons
        
        // same as touch event handling
        var w = window.innerWidth;
        var h = window.innerHeight;

        // doesn't work -- viewport changes size according to 
        //var w = document.body.clientWidth;
        //var h = document.body.clientHeight;

        var r = Math.min(w,h) / 12;

        if (r > 40) r = 40;

        el = document.getElementById("controls_right_panel");
        el.style.left = w-r*6;
        el.style.top = h-r*7;
        el.style.width = r*6;
        el.style.height = r*7;
        if (el.getAttribute("src") != p8_gfx_dat["controls_right_panel"]) // optimisation: avoid reload? (browser should handle though)
            el.setAttribute("src", p8_gfx_dat["controls_right_panel"]);

        el = document.getElementById("controls_left_panel");
        el.style.left = 0;
        el.style.top = h-r*6;
        el.style.width = r*6;
        el.style.height = r*6;
        if (el.getAttribute("src") != p8_gfx_dat["controls_left_panel"]) // optimisation: avoid reload? (browser should handle though)
            el.setAttribute("src", p8_gfx_dat["controls_left_panel"]);
        
        // scroll to cart 
        // p8_frame.scrollIntoView(true);

        document.getElementById("touch_controls_gfx").style.display="table";
        document.getElementById("touch_controls_background").style.display="table";

    }
    else{
        document.getElementById("touch_controls_gfx").style.display="none";
        document.getElementById("touch_controls_background").style.display="none";
    }

    if (!p8_is_running)
    {
        p8_playarea.style.display="none";
        p8_container.style.display="flex";

//			p8_container.style.marginTop="auto";

        // trying to vertically center label / play button
        // why doesn't auto marginTop work? setting p8_container.style.height above. gah
        // instead: set padding, and then turn it off again once playing
        p8_container.style.paddingTop = (frame_height - csize_y) / 2;

        el = document.getElementById("p8_start_button");
        if (el) el.style.display="flex";
    }
    else{
        // see above
        p8_container.style.paddingTop = 0;
    }
    requestAnimationFrame(p8_update_layout);

}
