function renderMessage(message)
{
    let m = document.createElement('div');
    m.setAttribute('class', 'message');
    let content = document.createElement('div');
    //content.setAttribute('class','text');
    let status = document.createElement('div');
    status.setAttribute('class','status');
    let title = null;
    let sent = null;
    let hour = document.createElement('span');

    if (message.from === state.user)
    {
        sent = document.createElement('span');
        hour.setAttribute('class','hour');
        m.setAttribute('style', 'margin: 3px 10px 3px auto;background-color: #C0FFC0;');
        if(message.sent)
            sent.innerText = '✓✓';
        else
            sent.innerText = '✓';

        if(message.read)
            sent.setAttribute('class','message-read');
    } else {
        m.setAttribute('style', 'margin-left:10px; background-color: white;');
    }
    if(message.date)
    {
        hour.innerText = formatDate(message.date);
        status.appendChild(hour);
    }
    if(sent)
        status.appendChild(sent);

    if(message.priority === 'high')
        m.style.borderLeftColor = 'lightsalmon';

    if(message.title)
    {
        title = document.createElement('div');
        title.setAttribute('class','title');
        title.innerText = message.title;
        m.appendChild(title);
    }

    //resolve content

    switch(message.content)
    {
        case 'text':
            content.innerHTML = '<div class="text">' + message.message.text + '</div>';
            break;
        case 'icon':
            content.innerHTML = '<div class="icon">' + message.message.icon + '</div>';
            break;
        case 'text/image':
            content.innerHTML = 
            '<div class="image">' +
                '<img src="' + message.message.url + '">' +
            '</div>' +
            '<div class="text">' + message.message.text + '</div>'
            break;
        case 'text/html':
            content.innerHTML = message.message.html;
            break;
    }

    m.appendChild(content);
    m.appendChild(status);

    //console.log(m.outerHTML);
    return(m);



}