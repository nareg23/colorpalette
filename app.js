// Selectors.
const colorDivs = document.querySelectorAll('.color');
const colorText = document.querySelector('.color h2');
const slider = document.querySelectorAll('input[type="range"]');
const currentHex = document.querySelectorAll('h2');
const popup = document.querySelector('.copy-container');
const adjustButtons = document.querySelectorAll('.adjust');
const closeButtons = document.querySelectorAll('.slider button');
const sliders = document.querySelectorAll('.slider');
const generateBtn = document.querySelector(".generate");
const lockBtns = document.querySelectorAll('.lock');
const saveBtn = document.querySelector('.savebtn');
const closeSaveBtn = document.querySelector('.close-save');
const library = document.querySelector('.library');
const closeLibBtn = document.querySelector('.close-library');
const savePaletteBtn = document.querySelector('.submit-save');
const selectPaletteUI = document.querySelector('select')
const submitSelectionUI = document.querySelector('.submit-selection');


// array will be used for colorizing sliders.
let baseColors;
let palette = [];

// Event listeners.
submitSelectionUI.addEventListener('click', e => {
    loadPalette(e);
})

savePaletteBtn.addEventListener('click', savePaletteEvent);

closeLibBtn.addEventListener('click', e => {
    const libContainer = document.querySelector('.library-container');
    const libpopBox = libContainer.children[0];
    libContainer.classList.remove('active');
    libpopBox.classList.remove('active');
})

library.addEventListener('click', (e) => {
    selectPalettes();
    const libContainer = document.querySelector('.library-container');
    const libpopBox = libContainer.children[0];
    libContainer.classList.add('active');
    libpopBox.classList.add('active');
});

saveBtn.addEventListener('click', (e) => {
    const saveContainer = document.querySelector('.save-container');
    saveContainer.classList.add('active');
    const popbox = saveContainer.children[0];
    popbox.classList.add("active");

})

closeSaveBtn.addEventListener('click', e => {
    const saveContainer = e.target.parentElement.parentElement;
    saveContainer.classList.remove('active');
    const popbox = saveContainer.children[0];
    popbox.classList.remove('active');
})

lockBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        lockDiv(index);
    })
})

generateBtn.addEventListener('click', (e) => {
    setColors();
})

slider.forEach(element => {
    element.addEventListener('input', sliderEvent);
});

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updatehexUI(index);
    });
});

currentHex.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipBoard(hex);
    })
})
// Make the copy-clipbaord window disappear.
popup.addEventListener('transitionend', () => {
    const copyBox = popup.children[0];
    popup.classList.remove('active');
    copyBox.classList.remove('active');
})
// show controls.
adjustButtons.forEach((btn, index) => {
    btn.addEventListener('click', e => {
        showControls(index);
    })
})

closeButtons.forEach((btn, index) => {
    btn.addEventListener('click', e => {
        closeControls(index);
    })
})
// end of EventListeners.
function getRandomColor() {
    const hexColor = chroma.random();
    return hexColor;
}

function setColors() {
    baseColors = [];
    colorDivs.forEach((div, index) => {
        const randomColor = getRandomColor();
        const hextext = div.children[0];
        // Check if it's locked.
        if (lockBtns[index].classList.contains('locked')) {
            baseColors.push(hextext.innerText);
        } else {
            hextext.innerText = randomColor;
            baseColors.push(hextext.innerText);
        }
        // Set Background
        div.style.backgroundColor = baseColors[index];
        // check contrast for the text.
        checkContrast(baseColors[index], hextext);
        //initilize sliders.
        const color = chroma(baseColors[index]);
        const sliders = div.querySelectorAll('.slider input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        sliderColors(color, hue, brightness, saturation);
        // check contrast for the text.
        checkContrast(baseColors[index], hextext);
        checkContrast(baseColors[index], adjustButtons[index]);
        checkContrast(baseColors[index], lockBtns[index]);

    });
    // Reset sliders Range values.
    resetSliders();
}

function sliderColors(color, hue, brightness, saturation) {
    // Scale Saturation.
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    // Scale brightness.
    const brightnessMid = color.set('hsl.l', 0.5);
    const scalebrightness = chroma.scale(["black", brightnessMid, "white"]);
    // update input colors.
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scalebrightness(0)},${scalebrightness(0.5)},${scalebrightness(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right , rgb(204, 75, 75), rgb(204,204 ,75),rgb(75, 204, 75),rgb(75, 204, 204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75)`;
}
// check color contrast for the hex text color.
function checkContrast(color, text) {
    // get the brightness of the div background.
    const luminance = chroma(color).luminance();
    if (luminance > 0.3) {
        text.style.color = '#303130';
    } else {
        text.style.color = '#efe4f1';
    }
}
//reused functions.
function resetSliders() {
    const sliders = document.querySelectorAll('.slider input');
    sliders.forEach((slider => {
        if (slider.name == 'hue') {
            const hueColor = baseColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name == 'brightness') {
            const brightColor = baseColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if (slider.name == 'saturation') {
            const satColor = baseColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    }))
}
// Event Functions.
function sliderEvent(e) {
    const index = e.target.getAttribute('data-hue') || e.target.getAttribute('data-sat') || e.target.getAttribute('data-bright');
    const slider = e.target.parentElement.querySelectorAll('input[type="range"]');
    // Base color.
    const bgcolor = baseColors[index];
    const hue = slider[0];
    const brightness = slider[1];
    const saturation = slider[2];
    const color = chroma(bgcolor)
        .set('hsl.h', hue.value)
        .set('hsl.l', brightness.value)
        .set('hsl.s', saturation.value);
    ;
    colorDivs[index].style.backgroundColor = color.hex();
    sliderColors(color, hue, brightness, saturation);
}

function updatehexUI(index) {
    const currentDiv = colorDivs[index];
    const bgcolor = chroma(currentDiv.style.backgroundColor);
    const text = currentDiv.querySelector('h2');
    text.innerText = bgcolor.hex();
    const icons = currentDiv.querySelectorAll('.controls button');
    // check Contrast for the text
    checkContrast(bgcolor, text);
    // check contrtast for the control icons.
    for (const icon of icons) {
        checkContrast(bgcolor, icon);
    }
}

function checkbuttonColor(index) {
    const currentDiv = colorDivs[index];
    const bgcolor = chroma(currentDiv.style.backgroundColor);
}
// This function will copy the hex into the clipboard.
const copyToClipBoard = hex => {
    //Creating a textarea. (this is the only way to copy something).
    const el = document.createElement('textarea');
    // assign hex value to textarea
    el.value = hex.innerText;
    // Add the textarea to the body
    document.body.appendChild(el);
    // select the textarea.
    el.select();
    // the actual copying.
    document.execCommand('copy');
    //destroy the textarea
    document.body.removeChild(el);
    // make copybox appear.
    popup.classList.add('active');
    const popbox = popup.children[0];
    popbox.classList.add('active');
}

const showControls = (index) => {
    const chosenSlider = sliders[index];
    chosenSlider.classList.add('active');
}

const closeControls = (index) => {
    const chosenSlider = sliders[index];
    chosenSlider.classList.remove('active');
}

const lockDiv = (index) => {
    const currentBtn = lockBtns[index];
    const btnChild = currentBtn.children[1];
    currentBtn.classList.toggle('locked');
    if (currentBtn.classList.contains('locked')) {
        currentBtn.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
        currentBtn.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}
// resets and fills the options.
function selectPalettes() {
    const options = document.querySelectorAll('option') || false;
    if (options) {
        options.forEach(option => {
            option.remove();
        })
    }
    storedPalette = loadStorage();
    console.log(storedPalette);
    storedPalette.forEach((element, index) => {
        const option = document.createElement('option');
        option.innerText = element.name;
        option.value = index;
        selectPaletteUI.appendChild(option);
    })
}

function loadPalette(e) {
    let palleteIndex;
    const options = selectPaletteUI.childNodes
    // check which option is selected.
    options.forEach(option => {
        if (option.selected) {
            palleteIndex = option.value;
        } else {
            return
        }
        colorDivs.forEach((div, index) => {
            div.style.backgroundColor = palette[palleteIndex].colors[index];
        })



    })
}

//storage
function loadStorage() {
    const data = sessionStorage.getItem('palettes');
    if (data) {
        const palette = JSON.parse(data);
        return palette
    } else {
        return false;
    }
}

function saveStorage(paletteList, paletteName) {
    const data = {
        name: paletteName,
        colors: paletteList
    }
    palette.push(data);
    sessionStorage.setItem("palettes", JSON.stringify(palette));
}

function savePaletteEvent() {
    const inputUI = document.querySelector('.save-name');
    let singlePalette = [];
    if (inputUI.value === "") {
        console.log("no name");
        return
    }
    colorDivs.forEach((div) => {
        singlePalette.push(div.style.backgroundColor);
    })
    saveStorage(singlePalette, inputUI.value);
    //Remove the save popup.
    inputUI.value = ""
    const saveContainer = document.querySelector('.save-container');
    saveContainer.classList.remove('active');
}

function selectPalettes() {
    const options = document.querySelectorAll('option') || false;
    if (options) {
        options.forEach(option => {
            option.remove();
        })
    }
    storedPalette = loadStorage();
  
    storedPalette.forEach((element, index) => {
        const option = document.createElement('option');
        option.innerText = element.name;
        option.value = index;
        selectPaletteUI.appendChild(option);
    })
}


// Dynamo
setColors();
