/*
 * Created by Stefan Korecko, 2020
 * Form processing functionality
 */

let opinions = [];


if (localStorage.myOpinions) {
    opinions = JSON.parse(localStorage.myOpinions);
}


console.log(opinions);

function processOpnFrmData(event){
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    // const nopName = document.getElementById("nameElm").value.trim();
    // const nopOpn = document.getElementById("opnElm").value.trim();
    // const nopWillReturn = document.getElementById("willReturnElm").checked;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const opinion = document.getElementById("opinion").value.trim();
    const improvements = document.getElementById("chooseInput").value.trim();
    const url = document.getElementById("imgLinkInput").value.trim();
    const liked = checkRadioButtons();

    //3. Verify the data
    if(name=="" || opinion==""){
        window.alert("Please, enter both your name and opinion");
        return;
    }

    //3. Add the data to the array opinions and local storage
    const newOpinion =
        {
            name: name,
            email: email,
            opinion: opinion,
            improvements: improvements,
            liked: liked,
            url: url,
            created: new Date() // new Date(2018, 11, 24, 10, 33, 30, 0)
        };

    console.log("New opinion:\n " + JSON.stringify(newOpinion));


    if(localStorage.myOpinions){
        opinions=JSON.parse(localStorage.myOpinions);
    }

    opinions.push(newOpinion);
    localStorage.myOpinions = JSON.stringify(opinions);


    //5. Go to the opinions
    window.location.hash="#opinions";

}
function checkRadioButtons(){
    let yes_btn = document.getElementById("yes");
    if(yes_btn.checked){
        return "yes";
    }else{
        return "no";
    }
}
