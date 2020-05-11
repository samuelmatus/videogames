let auth2 = {};
let googleUser = null;

function signOut() {
    googleUser = null;
    if(auth2.signOut) auth2.signOut();
    if(auth2.disconnect) auth2.disconnect();
}
// Updating Elements where we could input current users data
const updateSignIn = function() {
    // 1. Getting if somebody is signed
    let sgnd = auth2.isSignedIn.get();
    // 2. Based on value we get, doing action
    if (sgnd) {
        // Is signed
        // Hide Google Sign in button
        // Reveal current user and sign out button
        googleUser = auth2.currentUser.get();
        document.getElementById("SignInButton").classList.add("hide");
        document.getElementById("SignedIn").classList.remove("hide");
        document.getElementById("SignedIn").classList.add("show");
        document.getElementById("userName").innerHTML = auth2.currentUser.get().getBasicProfile().getName();
        console.log(auth2.currentUser.get().getBasicProfile().getName());
    } else {
        // Not signed in
        // Show Google Sign In Button
        document.getElementById("SignInButton").classList.remove("hide");
        document.getElementById("SignedIn").classList.add("hide");
        document.getElementById("SignedIn").classList.remove("show");
    }

    // 3.Getting elements where we can enter current users name and email
    let newArticleName = document.getElementById("author");
    let opinionName = document.getElementById("name");
    let opinionEmail = document.getElementById("mail");

    if (newArticleName) {
        if (sgnd) {
            newArticleName.value = auth2.currentUser.get().getBasicProfile().getName();
        }else{
            newArticleName.value="";
        }
    }

    if (opinionName && opinionEmail) {
        if (sgnd) {
            opinionName.value = auth2.currentUser.get().getBasicProfile().getName();
            opinionEmail.value = auth2.currentUser.get().getBasicProfile().getEmail();
        }else{
            opinionName.value="";
            opinionEmail.value="";
        }
    }
}

// Sign In to Google
function startGSingIn() {
    gapi.load('auth2', function() {
        gapi.signin2.render('SignInButton', {
            'width': 200,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
        });
        gapi.auth2.init().then(
            function (){
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn);
            });
    });

}