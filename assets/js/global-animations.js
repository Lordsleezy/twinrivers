document.addEventListener("DOMContentLoaded", function(){

const elements = document.querySelectorAll(".fade-in-right, .fade-in-left, .fade-in-up");

const observer = new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("visible");
}
});
},{threshold:0.15, rootMargin: '0px 0px -50px 0px'});

elements.forEach(el=>{
observer.observe(el);
});

});
