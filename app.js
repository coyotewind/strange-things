// global variables for api calls

const BASE = 'https://strangers-things.herokuapp.com/api/2004-UNF-HY-WEB-PT';
const API = {
    USERS: 'users',
    POSTS: 'posts',
    TEST: 'test',
    ENDPOINTS: {
        REGISTER: 'register',
        LOGIN: 'login',
        USER: 'user',
        ME: 'me',
        DATA: 'data',
        MESSAGES: 'messages'
    },
}
const { USERS, POSTS, TEST } = API;
const { REGISTER, LOGIN, USER, ME, DATA, MESSAGES } = API.ENDPOINTS;

// state variables for posts, user sessions, and more

const state = { 
    posts: [] 
};
let session;
let loggedIn;
let postID;
let dataFromPost;
let dataFromMessage;
let newWidth;

//POST REQUESTS

// register user

async function registerUser() {
    try { // check if/else there is a mismatch and if so trigger alert or something
        const response = await fetch(`${BASE}/${USERS}/${REGISTER}`, {
            method: "POST",
            headers: makeHeaders(),
            body: JSON.stringify({
                user: {
                    username: $('#enter-username').val(),
                    password: $('#enter-password').val(),
                }
            }),
        })
        const results = await response.json()
        const { token } = results.data;
        session = token;
        login(); 
        console.log('register user')
    }
    catch (error) {
        (console.error);
    }
}

// login user

async function loginUser() {
    try {
        const response = await fetch(`${BASE}/${USERS}/${LOGIN}`, {
            method: "POST",
            headers: makeHeaders(),
            body: JSON.stringify({
                user: {
                    username: $('#username').val(),
                    password: $('#password').val(),
                }
            }),
        })
        const results = await response.json()
        const { token } = results.data;
        session = token;
        login();
        console.log('login user')
    }
    catch (error) {
        (console.error);
    }
}

// create post

async function createPost(postObj) {
    try {
        if(loggedIn) {
            const response = await fetch(`${BASE}/${POSTS}`, {
                method: 'POST',
                body: JSON.stringify(postObj),
                headers: makeHeaders()
            })
            const results = await response.json();
            fetchAllPosts();
            console.log(postObj)
            console.log('create post')
        }
    }
    catch (error) {
        (console.error);
    } 
}

// create message

async function createMessage(messageObj, POST_ID) {
    try {
        if(loggedIn) {
            const response = await fetch(`${BASE}/${POSTS}/${POST_ID}/${MESSAGES}`, {
                method: 'POST',
                body: JSON.stringify(messageObj),
                headers: makeHeaders()
            })
            const results = await response.json();
            $('#feed').empty();
            fetchAllPosts();
            console.log('create message')
        }
    }
    catch (error) {
        (console.error);
    } 
}

// DELETE REQUESTS

async function deletePost(POST_ID) {
    try {
        if(loggedIn) {
            const response = await fetch(`${BASE}/${POSTS}/${POST_ID}`, {
                method: 'DELETE',
                headers: makeHeaders()
            })
            const results = await response.json();
            fetchAllPosts();
            console.log('delete post')
        }
    }
    catch (error) {
        (console.error);
    }
}

// GET REQUESTS

// fetch all posts

async function getUserData() {
    try {
        if(loggedIn) {
            const response = await fetch(`${BASE}/${TEST}/${ME}`, {
                method: "GET",
                headers: makeHeaders(),
            })
            const results = await response.json();
            state.whois = results.data.user.username;
            $('#user-name').append(`${state.whois}!` );
        }
    } catch (error) {
        (console.error);
    }
}

async function fetchAllPosts() {
    try {
        const response = await fetch(`${BASE}/${POSTS}`, {
            method: "GET",
            headers: makeHeaders(),
        })
        const results = await response.json()
        state.posts = results.data.posts;
        updatePosts(state.posts);
        console.log('fetch posts from api')
    } catch (error) {
        (console.error);
    } finally {
        
    }
}

// filter posts

function filterPosts(){
    const keywords = $("#keyword").val();
    posts = state.posts
    const filter = posts.filter(function(post){
        return post.title.includes(keywords) || post.description.includes(keywords);
    });
    console.log('filter posts by keyword');
    return filter;
}

// RENDER DATA

// render all posts and search results

function renderPosts(post) {
    const { title, description, price, location, messages, createdAt, isAuthor, _id } = post;
    const { username } = post.author;
    const image = Math.floor(Math.random() * 10);
    const choices = ['animals','nature','tech'];
    const types = choices[Math.floor(Math.random() * choices.length)];
    const created = moment(createdAt).format('DD MMMM YYYY');
    const postEl = $(`
        <div class="post">
            <div class="image">
                <img src="https://placeimg.com/320/180/${types}/${image}" alt="animals">
            </div>
            <div class="info">
                <h5 class="title">${title}</h5>
                <div class="location">
                    ${location === '[On Request]' 
                        ? '(Available On Request)' 
                
                        : `(${location})` 
                    }
                </div>  
                <div class="price">${price.startsWith('$') ? price : '$'+price}</div>
                <div class="desc">${description}</div>
                <div class="date">Posted on ${created} by ${username}</div>
            </div> 
            <div class="controls">
                ${ !isAuthor 
                    ? loggedIn 
                         ? `<button class="action" data-modal="#add-message">
                            <i class="material-icons">comment</i><span>Contact Seller</span>
                            </button>`  
                        : `<button class="action" data-modal="#require-auth">
                            <i class="material-icons">comment</i><span>Contact Seller</span>
                        </button>`
                    : isAuthor 
                        ? `<button class="action view-messages" data-id="${_id}" data-modal="#view-messages">
                            <i class="material-icons">comment</i>
                            <span>View Messages</span>
                            <span class="message-count">(${messages ? messages.length : ''})</span>
                        </button>
                        <button class="action float-right" data-id="${_id}" data-modal="#delete-post">
                            <i class="material-icons">delete</i>
                        </button>
                        <button class="action float-right" data-modal="#edit-post">
                            <i class="material-icons">edit</i>
                        </button>` 
                    : '' }
            </div>   
        </div>
    `).data('post', post);
    console.log('render posts')
    return postEl;
}

// render messages

function renderMessages(post) {
    const { messages } = post;
    const messageEl = $(`
    <div class="messages">
        <h4>Your Messages</h4><br>  
        ${ messages.length > 0
            ? messages.map(function(message) {
            return `
                <div class="message">
                    <div>${message.content}</div>
                    <div>${message.fromUser.username}</div>
                </div>
            `
            }).join('<div class="divider"></div>')
            : 'There are no messages yet. Please check again later.'
        }
    </div>
    `)
    console.log('render messages')
    return messageEl;
};

// update posts

function updatePosts(posts) {
    const root = $('#posts');
    const postList = root.find('#feed');
    posts.forEach(function (post) {
        postList.prepend(renderPosts(post));  
    });
    console.log('update posts')
}

// update search results

function renderPostSearch(posts){
    const display = $('#feed');
    posts.forEach(post =>{
        display.prepend(renderPosts(post));
    })
}

// HELPER FUNCTIONS

// make headers

function makeHeaders() {
    if (localStorage.getItem('session')) {
        session = JSON.parse(localStorage.getItem('session'))
        const headers = { 
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${session}`,
        }  
        console.log('make auth headers')  
        return headers;
    } else {
        const headers = { 
            'Content-Type': 'application/json; charset=utf-8',
        }   
        console.log('make free headers')
        return headers;
    }
}

// login

function login() {
    localStorage.setItem('session', JSON.stringify(session));
    $('#user-name').append(state.whois);
    $('.accord-body:first-child').slideDown(400);
    bootstrap()
    console.log('store session')
}

// logout

function logout() {
    localStorage.removeItem('session');
    session = undefined; 
    state.whois = '';
    loggedIn = false;
    $('#user-name').empty();
    bootstrap();
    console.log('remove session')
}

// is logged in

function isLoggedIn() {
    localStorage.getItem('session')
        ? loggedIn = true
        : loggedIn = false
    console.log('logged = ', loggedIn);
}

// update nav

function updateUI() {
    if(loggedIn) {
        $('.auth').removeClass('hide');
        $('.free').addClass('hide');
    } else { 
        $('.auth').addClass('hide');
        $('.free').removeClass('hide');
    }
    console.log('update nav')
}

// CLICK HANDLERS

// create user

$('#create').on('click', function() {
    registerUser();
    $('.modal').hide();
    console.log('clickregister')
});

// login

$('#login').on('click', function() {
    loginUser();
    $('.modal').hide();
    console.log('click login')
});

// logout

$('#app').on('click', '#logout', function() {
    logout();
    console.log('click logout')
});

// create post

$('#create-post-modal').on('submit', async function(event) {
    event.preventDefault();
    const postObj = {
        post: {
            title: $('#post-title-modal').val(),
            description: $('#post-content-modal').val(),
            price: '$8.00',
            willDeliver: true,
            location: 'Las Americas'
        }
    }
    try {
        const newPost = await createPost(postObj);
        $('.modal').hide(); 
        console.log('click add post')    
    } catch (error) {
        (console.error);
    }
});

$('#create-post').on('submit', async function(event) {
    event.preventDefault();
    const postObj = {
        post: {
            title: $('#post-title').val(),
            description: $('#post-content').val(),
            price: '$8.00',
            willDeliver: true,
            location: 'Las Americas'
        }
    }
    try {
        const newPost = await createPost(postObj);
        $('.modal').hide(); 
        console.log('click add post')    
    } catch (error) {
        (console.error);
    }
});

// create message

$('#create-message').on('submit', async function(event) {
    event.preventDefault();
    const POST_ID = postID
    const messageObj = {
        message: {
            content: $('#message-content').val(),
        }
    }
    try {
        const addMessage = await createMessage(messageObj, POST_ID);
        $('.modal').hide();
        console.log('click add message');     
    } catch (error) {
        (console.error);
    }
});

// delete post

$('#app').on('click', '#delete', async function(event) {
    event.preventDefault();
    const POST_ID = postID;
    try {
        const removePost = await deletePost(POST_ID);
        $('.modal').hide();
        console.log('click delete');
    } catch (error) {
        (console.error);
    }
});

// search posts

$('#search').on('click', function(event){
    event.preventDefault();
    $('#feed').empty();
    const postList = filterPosts();
    renderPostSearch(postList);
    console.log('click search')
})

// MODALS

// open messages

$('#feed').on('click', '.view-messages', function() {
    const modal = $(this).data('modal');
    $('.messages').remove();
    const target = $(this).closest('.post')
    dataFromMessages = target.data('post');
    $('#show-messages').append(renderMessages(dataFromMessages));
    $(modal).show();
    console.log('open =', modal)
});

// open from feed

$('#feed').on('click', '.action:not(.view-messages)', function() {
    const modal = $(this).data('modal');
    const target = $(this).closest('.post')
    dataFromPost = target.data('post')
    postID = dataFromPost._id
    $(modal).show();
    // history.replaceState({}, document.title, ".");
    console.log('open =', modal)
});

// open from nav

$('#nav').on('click', '.action', function() {
    const modal = $(this).data('modal');
    console.log(this);
    $(modal).show();
    console.log('open =', modal)
});

// open from sidebar

$('#sidebar').on('click', '.action', function() {
    const modal = $(this).data('modal');
    console.log(this);
    $(modal).show();
    console.log('open =', modal)
});

// open another modal from inside a modal

$('#send-to-register, #send-to-login').on('click', function() {
    $('#require-auth').hide();
    const modal = $(this).data('modal');
    $(modal).show();
    console.log('open =', modal)
});

// close a modal

$('.modal').on('click', function(e) {
    const className = e.target.className;
    if(className === 'modal' || className === 'close') {
        $(this).closest('.modal').hide();
      console.log('close =', className)
    }
    
});

// confirm delete

$('#confirm-delete').keyup(function() {
    if ($(this).val() === 'DELETE') {
        $('#delete').prop('disabled', false);
        console.log('delete confirm = false')
    } else {
        $('#delete').prop('disabled', true);
        console.log('delete confirm = true')
    }
    console.log('confirm delete')
});

// EVENT LISTENERS

// drag & drop for dynamic sidebar

let handler = document.querySelector('#drag');
let wrapper = handler.closest('#content');
let isHandlerDragging = false;

document.addEventListener('mousedown', function(e) {
    if (e.target === handler) { 
        isHandlerDragging = true;
    }
});

document.addEventListener('mousemove', function(e) { 
    if (!isHandlerDragging) { 
        return false; 
    }
    let containerOffsetLeft = wrapper.offsetLeft;
    let pointerRelativeXpos = e.clientX - containerOffsetLeft;

    newWidth = (Math.min(480, Math.max(300, pointerRelativeXpos))) + 'px';
    localStorage.setItem('newWidth', JSON.stringify(newWidth));
    wrapper.style.gridTemplateColumns = newWidth+' 0.4rem auto';
    console.log('sidebar width = ', newWidth)
});

document.addEventListener('mouseup', function(e) {
    isHandlerDragging = false;
});

// initialize page

function bootstrap() { 
    if (localStorage.getItem('newWidth')) {
        bootWidth = JSON.parse(localStorage.getItem('newWidth'));
        wrapper.style.gridTemplateColumns = bootWidth+' 0.4rem auto';       
    }
    isLoggedIn();
    getUserData()
    fetchAllPosts();
    updateUI();
    console.log('initialize')
}

$(document).ready(function() { 
    $('.accord-head').click(function () {
		if ( $('.accord-body').is(':visible') ) {
			$('.accord-body').slideUp(400);
            $('.accord-head').css( {'background-color': 'transparent', 'color': '#CFC3CF'} )
            $('.accord-head i').css({'transform': 'rotate(0deg)', 'transform': 'rotate(0deg)', 'transition': 'transform 0.3s'});
        }
        if ( $(this).next('.accord-body').is(':visible') ) {
            $(this).next('.accord-body').slideUp(400);
        } else {
            $(this).next('.accord-body').slideDown(400);
            $(this).children('.accord-head i').css({'transform': 'rotate(90deg)', 'transition': 'transform 0.3s'});
        }
    });
});
bootstrap();