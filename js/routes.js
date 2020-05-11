//an array, defining the routes
//575467872819-srpukk1nir01r0vi670f19fisij2fli2.apps.googleusercontent.com
export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"welcome",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML
    },

    {
        hash:"articles",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash:"opinions",
        target:"router-view",
        getTemplate: createHtml4opinions
    },
    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: addOpinion
    },
    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },
    {
        hash:"artDelete",
        target:"router-view",
        getTemplate: removeArticle
    },
    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: addArticle
    }

];

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;
let offset = Number(0);
let totalCount = Number(0);

function addOpinion(targetElm){
    document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML;
    if(googleUser){
        document.getElementById("name").value = googleUser.getBasicProfile().getName();
    }
    
    
}

function createHtml4opinions(targetElm){
    const opinionsFromStorage=localStorage.myOpinions;
    let opinions=[];

    if(opinionsFromStorage){
        opinions=JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}

function fetchAndDisplayArticles(targetElm, current, offsetFromHash, totalCountFromHash){    

    
    offset= Number(offsetFromHash);
    totalCount=Number(totalCountFromHash);
    current = parseInt(current);

    let obj={
        articleList:[],
        link:"#artInsert"
    };

    let urlQuery = "";
    let urlOffset = "";

    if (offset == null || offset == undefined || offset==NaN || offset == ""){
        urlOffset=`offset=0`;
    }else{
        urlOffset=`offset=${offset}`;
    }
    urlQuery = `/?max=`+articlesPerPage+`&offset=`+offset;

    const url1 = `${urlBase}/article${urlQuery}`;
    const url2 =`${urlBase}/article`

    fetch(url1)
    .then(response => {
        if(response.ok){
            return response.json();
        }else{
            return Promise.reject(new Error(`Failed to access the list of articles. Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
        }
    })
    .then(responseJSON => {
        totalCount = responseJSON.meta.totalCount;
        addArtDetailLink2ResponseJson(responseJSON);
        obj.articleList=responseJSON.articles;
        console.log(responseJSON);
        pagesSetup(responseJSON.meta, current);
        console.log(obj.pages);
        return Promise.resolve();
    })
    .then( ()=> {

        let prrt;

        let cntRequests = obj.articleList.map(
            article => fetch(`${url2}/${article.id}`)
        );
        return Promise.all(cntRequests);
    })
    .then(responses =>{
        let failed="";
        for(let response of responses) {
            if(!response.ok) failed+=response.url+" ";
        }
        if(failed===""){
            return responses;
        }else{
            return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
        }
    })
    .then(responses => Promise.all(responses.map(resp => resp.json())))
    .then(articles => {
        articles.forEach((article,index) =>{
            obj.articleList[index].content=article.content;
        });
        return Promise.resolve();
    })
    .then( () =>{
        console.log(obj);
        document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-articles").innerHTML, obj);
    });


    function pagesSetup(meta, current){

        let pages ={};
        pages.current = parseInt(current);
        offset = Number(meta.offset)
        pages.pageCount = parseInt(Math.ceil(totalCount/20));
    
        
        if(pages.current == null || pages.current == undefined || pages.current == NaN){
            pages.current = 1;
        }
        if (offset + 20 < totalCount) {
            pages.next = pages.current + 1;
            pages.nextOffset = Number(offset)+Number(articlesPerPage);
        }
        if (pages.current > 1) {
            pages.previous = pages.current - 1;
            pages.previousOffset = Number(offset)-Number(articlesPerPage);
        }
        
        obj.pages = pages;
    }

}

function addArtDetailLink2ResponseJson(responseJSON){
    responseJSON.articles =
        responseJSON.articles.map(
            article =>(
                {
                    ...article,
                    detailLink:`#article/${article.id}`
                }
            )
        );
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash) {
    fetchAndProcessArticle(targetElm,artIdFromHash,false,false);
    //displayComments(targetElm, artIdFromHash);
}


/**
 * Gets an article record from a server and processes it to html according to the value of the forEdit parameter.
 * Assumes existence of the urlBase global variable with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates with id="template-article" (if forEdit=false)
 * and id="template-article-form" (if forEdit=true).
 * @param targetElm - element to which the acquired article record will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */
function fetchAndProcessArticle(targetElm, artIdFromHash,forEdit, ForAddNew) {
    
    console.log("edit:"+forEdit+" new:"+ForAddNew);
    let url;
    if(ForAddNew){
        url = `${urlBase}/article`;
    } else{
        url = `${urlBase}/article/${artIdFromHash}`;
    }
    
    let current = Number(0);

    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            console.log(responseJSON);
            current = (Number(offset)/Number(20))+Number(1);
            
            

            if(ForAddNew){
                responseJSON.formTitle="New article";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,null,${offset},${totalCount},'${urlBase}','POST',${current})`;
                responseJSON.submitBtTitle="ADD";
                responseJSON.urlBase=urlBase;
                if(googleUser) {
                    responseJSON.author = googleUser.getBasicProfile().getName();
                }

                responseJSON.backLink=`#articles/${current}/${offset}`;

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
            }else {if(forEdit){
                responseJSON.formTitle="Article Edit";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${offset},${totalCount},'${urlBase}', 'PUT', ${current})`;
                responseJSON.submitBtTitle="SAVE";
                responseJSON.urlBase=urlBase;

                responseJSON.backLink=`#article/${artIdFromHash}`;

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
            }else{

                responseJSON.backLink=`#articles/${current}/${offset}`;
                responseJSON.editLink=`#artEdit/${responseJSON.id}`;
                responseJSON.deleteLink=`#artDelete/${responseJSON.id}/${current}/${offset}`;
                
                
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        responseJSON
                    );
                loadComments(artIdFromHash);
                setupAddComment(artIdFromHash);
            }}
            
            
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

}

function editArticle(targetElm, artIdFromHash) {
    fetchAndProcessArticle(targetElm,artIdFromHash,true,false);
}

function removeArticle(targetElm, articleId , current){
    let options = {
        method: "DELETE"
    }

    const delUrl = `${urlBase}/article/${articleId}/`

    fetch(delUrl, options)
        .then(response => {
            if (response.status == 204) {
                window.location = `#articles/${current}/${offset}`;
                return Promise.resolve();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch(error => {
            console.log(`Failed to delete article. ${error}.`);
        });
}

function addArticle(targetElm){    
    
    fetchAndProcessArticle(targetElm,null,false,true);
}

function loadComments(artIdFromHash){

    let comments;

    fetch(`${urlBase}/article/${artIdFromHash}/comment/?max=100&offset=0`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else { //if we get server error
            return Promise.reject(new Error(`Failed to access comments of the article with url ${response.url}.`));
        }
    })
    .then((responseJSON) => {
        let comments = responseJSON.comments;

        let parsedHTML = "";
        comments.forEach(comment => {
            comment.created = (new Date(comment.dateCreated)).toLocaleString();
            comment.updated = (new Date(comment.lastUpdated)).toLocaleString();

            parsedHTML += Mustache.render(document.getElementById("template-article-comment").innerHTML, comment);
        });
        document.getElementById("articleComments").innerHTML = parsedHTML;

        // setupCommentNav(responseJSON.meta);
        // sessionStorage.latestCommentPage = commentPage;
        return Promise.resolve();
    })
    .catch(error => {
        const errMsgObj = {
            errMessage: error
        };
        document.getElementById("articleComments").innerHTML =
            Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
    });
                
}

function setupAddComment(artIdFromHash){
    const commentForm = document.getElementById("addCommentForm");

	 if(googleUser) {
	 	document.getElementById("author").value = googleUser.getBasicProfile().getName();
	 }

    if(commentForm != null)
	commentForm.addEventListener("submit", submitComment);

	function submitComment(event) {
		event.preventDefault();

		const authorVal = commentForm.elements.namedItem("author").value.trim();
		const textVal = commentForm.elements.namedItem("text").value.trim();

		if (authorVal == "" || textVal == "") {
			return;
		}

		const request = {
			author: authorVal,
			text: textVal,
		};

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(request)
		};

		let completeUrl = `${urlBase}/article/${artIdFromHash}/comment`;

		fetch(completeUrl, options)
			.then(response => {
				if (response.status == 201) {
					return response.json();
				} else {
					return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
				}
			})
			.then(comment => {
				loadComments(artIdFromHash);
				return Promise.resolve();
			})
			.catch(error => {
				console.error("Failed to add comment, " + error);
			}).finally(() => {
				document.getElementById('commentForm').classList.add("hidden");
				commentForm.reset();
			});		
	}
}


