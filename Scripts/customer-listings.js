
const prev = document.querySelector("#prev1");
const next = document.querySelector("#next1");
const carouselImg = document.querySelector("#carousel-image");

const slideArray= [
    '/High-Fidelity-Prototype/Images/OBX Beach House 1.png', '/High-Fidelity-Prototype/Images/OBX Beach House 2.png', 
    '/High-Fidelity-Prototype/Images/OBX Beach House 3.png', '/High-Fidelity-Prototype/Images/OBX Beach House 4.png'
];

let currentIndex = 0;
carouselImg.src = slideArray[currentIndex];

prev.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slideArray.length) % slideArray.length;
    updateImageOne();
});

next.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slideArray.length;
    updateImageOne();
});

function updateImageOne() {
    carouselImg.src = slideArray[currentIndex];
}


const previous = document.querySelector("#prev2");
const nexxt = document.querySelector("#next2");
const carouselImage = document.querySelector("#carousel-image1");

const slideArrayOne= [
    '/High-Fidelity-Prototype/Images/Surf City Beach House1.jpeg', '/High-Fidelity-Prototype/Images/Surf City Beach House2.jpeg', 
    '/High-Fidelity-Prototype/Images/Surf City Beach House3.jpeg', '/High-Fidelity-Prototype/Images/Surf City Beach House4.jpeg'
];


let currentIndexOne = 0;
carouselImage.src = slideArrayOne[currentIndexOne];

previous.addEventListener("click", () => {
    currentIndexOne = (currentIndexOne - 1 + slideArrayOne.length) % slideArrayOne.length;
    updateImageTwo();
});

nexxt.addEventListener("click", () => {
    currentIndexOne = (currentIndexOne + 1) % slideArrayOne.length;
    updateImageTwo();
});

function updateImageTwo() {
    carouselImage.src = slideArrayOne[currentIndexOne];
}



