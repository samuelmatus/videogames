
let opinions = [];

const opinions_div = document.getElementById("storedOpinions");

if (localStorage.myOpinions) {
    opinions = JSON.parse(localStorage.myOpinions);
}

opinions_div.innerHTML = opinionArray2html(opinions);

console.log(opinions);

let myFrmElm = document.getElementById("formular");
myFrmElm.addEventListener("submit", processSubmit);

document.getElementById("clearBTN").onclick = clear;

let email_id = document.getElementById("email");
email_id.addEventListener("input", checkEmail);

let name_id = document.getElementById("name");
name_id.addEventListener("input", checkName);

function checkEmail(){
    let email = email_id.value.trim();

    if(email === ""){
        email_id.setCustomValidity("Enter email address");
        return false;
    }
    if(!email.includes('@')){
        email_id.setCustomValidity("symbol @ expected");
        return false;
    }

    return true;
}

function checkName(){
    let name = name_id.value.trim();

    if(name === ""){
        name_id.setCustomValidity("Enter your name");
        return false;
    }
    if(name.length < 4){
        name_id.setCustomValidity("Name is short");
        return false;
    }
    if(name.length > 16){
        name_id.setCustomValidity("Name is long");
        return false;
    }

    return true;
}

function clear(event) {
    event.preventDefault();
    for (var i = 0; i < opinions.length; i++) {
        if(Date.now() - new Date(opinions[i].created) > 86400000){
            opinions.splice(i,1);
        }
    }

    localStorage.myOpinions = JSON.stringify(opinions);
    opinions_div.innerHTML = opinionArray2html(opinions);
    myFrmElm.reset();
}

function processSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const opinion = document.getElementById("opinion").value.trim();
    const improvements = document.getElementById("chooseInput").value.trim();
    const liked = checkRadioButtons();

    if(checkName() === false)
        return;

    if(checkEmail() === false)
        return;



    /*if (name === "" || email === "") {
        window.alert("Please, enter both your name and email");
        return;
    }*/

    const newOpinion =
        {
            name: name,
            email: email,
            opinion: opinion,
            improvements: improvements,
            liked: liked,
            created: new Date(2018, 11, 24, 10, 33, 30, 0) //new Date()
        };

    console.log("New opinion:\n " + JSON.stringify(newOpinion));

    opinions.push(newOpinion);

    localStorage.myOpinions = JSON.stringify(opinions);

    window.alert("Your opinion has been stored. Look to the console");
    console.log("New opinion added");
    console.log(opinions);

    opinions_div.innerHTML += opinion2html(newOpinion);

    myFrmElm.reset();

}

function opinion2html(opinion) {

    return `
    <section class="op_id">
       <h3>${opinion.name} <i>(${(new Date(opinion.created)).toDateString()})</i></h3>

       <p>${opinion.opinion}</p>
       <p>${"I would improve: " + opinion.improvements}</p>
    </section>`;

}

function opinionArray2html(sourceData) {

    let htmlWithOpinions = "";

    for (const opn of sourceData) {
        htmlWithOpinions += opinion2html(opn);
    }

    return htmlWithOpinions;

}

function checkRadioButtons(){
    let yes_btn = document.getElementById("yes");
    if(yes_btn.checked){
        return "yes";
    }else{
        return "no";
    }
}
