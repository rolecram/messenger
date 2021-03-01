function openMenu(d)
{
    //console.log('menu up/down',d.nextSibling);
    


    if(d.nextSibling.getAttribute('class')==='menu-up')
    {
        d.nextSibling.setAttribute('class','menu-down');

    }
    else
    {
        //console.log('service index',d.getAttribute('service'))
        let html = renderTitle(d.getAttribute('service'));
        document.getElementById('id-service-title').innerHTML = html;
        document.getElementById('id-service-content').innerHTML = '';

        d.nextSibling.setAttribute('class','menu-up');

    }

}
function menuOption(idService, idOption)
{
    //console.log('service', idService);
    //console.log('option', idOption);
    //console.log('service',services[idService].options[idOption].service);
    let html = renderTitle(idService);
    document.getElementById('id-service-title').innerHTML = html;
    console.log('service',services[idService].options[idOption].service);
    switch(services[idService].options[idOption].service)
    {
        case 'photos':
            renderSlider(idService, idOption);
            break;
        case 'reserve':
            renderReserve(idService, idOption);
            break;
        case 'chef-suggestion':
            renderSlider(idService,idOption);
            break;
        case 'menu':
            renderMenu(idService,idOption);
            break;
        case 'order':
            processOrder(idService,idOption);
            break;
        case 'car-catalog':
            renderCarCatalog(idService,idOption);
            break;
    }

}
function processOrder(id,option)
{
    let div = document.getElementById('id-option-' + id + '-' + option);
    let data = null;
    if(services[id].options[option].ordered)
    {
        div.style.backgroundColor = '';
        div.style.color = '';
        div.style.border = '';
        div.innerText = 'Order Now';
        services[id].options[option].ordered = false;
        data = {
            action : 'notify',
            payload: {
                from:'hotel',
                to:{
                    target:'guest',
                    value: state.contact.idContact
                },
                content: 'text',
                type : 'notification',
                message: {
                    text: services[id].name + ' Order Canceled!'
                },
                priority: 'normal',
                severity: 'warning'
            }
        };


    } else {
        div.style.backgroundColor = 'tomato';
        div.style.color = 'white';
        console.log('border', div.style.border);
        div.style.border = '0px';
        div.innerText = 'Cancel Order';
        services[id].options[option].ordered = true;
        data = {
            action : 'notify',
            payload: {
                from:'hotel',
                to:{
                    target:'guest',
                    value: state.contact.idContact
                },
                content: 'text',
                type : 'notification',
                message: {
                    text: services[id].name + ' Order'
                },
                priority: 'normal',
                severity: 'info'
            }
        };


    }
    services[id].options[option].name 
    doSend(data);
}
function renderTitle(i)
{
    //console.log('render title i=', i);
    //console.log('services', services);
    i = i * 1;
    let level = '';
    //console.log('services[i]', services[i]);

    document.getElementById('id-service-title').style.backgroundColor= 'white';

    if(services[i].capacity)
    {
        let percent = Math.round((services[i].capacity.now / services[i].capacity.total)*100);
        //console.log('percent',percent)
        let style = 'width:' + percent + 'px;'
        if(percent == 100)
            style +='background-color:lightsalmon;';
        else
            style +='background-color:khaki;';


        level = '<div style="font-weight: bold;font-size:8pt;">Occupancy Level</div>' +
        '<div class="level"><div class="value" style="' + style + '" >'+ percent + '%' +
        '</div></div>';
        if(percent == 100)
        {
            level += '<div style="font-size:8pt;">Estimated Waiting Time: 1 Hour</div>';
        }
    }
    let name = services[i].name;
    if(services[i].place)
        name += ' (' + services[i].place + ')';
    let html = '' +
    '<div class="title-left">' +
        '<div class="name">' + name +'</div>' +
        level +
    '</div>' +
    '<div class="title-right">' +
        '<div>' +
            '<div class="image" >' +
                '<img src="images/'+ services[i].contact.image + '" />' +
            '</div>' +
            '<div class="name">&#11088;' + services[i].contact.name + '</div>' +
            '<div class="info">' + services[i].contact.friendly + '</div>' +
        '</div>' +
        '<div style="margin-top:15px;">' +
        '<span class="add-contact" onclick="addContact(\'' + services[i].contact.id + '\');">Add Contact</span>' +
        '<span class="send-contact" onclick="sendContact(\'' + services[i].contact.id + '\');">Send Contact</span>' +
        '</div>' +
    '</div>';
    return(html);
}

function renderService(service)
{
    //console.log('service id',service.id);
    let html = '' +
    '<div class="service">' +
        '<div class="title" onclick="openMenu(this);" service="' + service.id + '">' +
            '<div class="image"><img src="images/' + service.icon + '"></div>' +
            '<div class="name">' + service.name + '</div>' +
            (service.state==='Close' || service.state==='Full'?'<div class="state-close">':'<div class="state-open">') + service.state + '</div>' +
        '</div>' +
        '<div class="menu-down">';

        for(var i = 0 ; i < service.options.length; i++)
        {
            html += '<div id="id-option-' + service.id + '-' + i + '" class="menu-option" onclick="menuOption(' + service.id + ',' + i +');">' + service.options[i].name + '</div>'
        }
        html += '</div>' +
    '</div>';
    //console.log('html service', html)
    return(html);
}
function renderServices()
{
    //services = Object.assign([], xservices);
    //console.log('xservices', xservices);
    services = JSON.parse(JSON.stringify(xservices));
    //console.log('services', services);

    document.getElementById('id-service-content').innerHTML = '';
    document.getElementById('id-service-title').innerHTML = '';
    document.getElementById('id-service-title').style.backgroundColor = '';
    document.getElementById('id-button-services').innerText = 'Open Services';

    let html = '',id = 0;
    services.forEach(service=>{
        service.id = id++;
        html+=renderService(service)
    });
    return(html);
}
function renderMenu(id,option)
{
    document.getElementById('id-service-content').innerHTML = restaurantMenu;
  
}
function renderCarCatalog(id,option)
{
    console.log('car catalog');
    document.getElementById('id-service-content').innerHTML = carCatalog;

}
function renderSlider(id,option)
{
    //console.log('render slider', id);
    let slider = document.createElement('div');
    slider.setAttribute('class','slider-content');

    let div = document.createElement('div');
    div.setAttribute('class','slider-button slider-button-left');
    div.setAttribute('onclick','sliderPrevious(' + id + ',' + option + ');');
    div.innerHTML = '&#10094;';
    slider.appendChild(div);

    div = document.createElement('div');
    div.setAttribute('class','slider-button slider-button-right');
    div.setAttribute('onclick','sliderNext(' + id + ',' + option + ');');
    div.innerHTML = '&#10095;';
    slider.appendChild(div);


    let img = null;
    //services[id].photos.forEach(photo=>{
    
    services[id].options[option].photos.forEach(photo=>{
        img = document.createElement('img');
        img.setAttribute('class', 'slide')
        img.setAttribute('src', 'images/' + photo);
        slider.appendChild(img);
    });
    //console.log('slider', slider);
    //console.log('slider html', slider.outerHTML);
    document.getElementById('id-service-content').innerHTML = slider.outerHTML;
    
    services[id].options[option].slide = 0;
    document.getElementsByClassName("slide")[0].style.display = 'block';

}
function sliderNext(id, option)
{
    document.getElementsByClassName("slide")[services[id].options[option].slide].style.display = 'none';
    services[id].options[option].slide++;
    if(services[id].options[option].slide >= services[id].options[option].photos.length)
        services[id].options[option].slide = 0;
    document.getElementsByClassName("slide")[services[id].options[option].slide].style.display = 'block';
    
}
function sliderPrevious(id, option)
{
    document.getElementsByClassName("slide")[services[id].options[option].slide].style.display = 'none';
    services[id].options[option].slide--;
    if(services[id].options[option].slide < 0)
        services[id].options[option].slide =  services[id].options[option].photos.length - 1;
    document.getElementsByClassName("slide")[services[id].options[option].slide].style.display = 'block';
    
}
function renderReserve(id, option)
{
    let percent = Math.round((services[id].capacity.now / services[id].capacity.total)*100);

    let selected = (services[id].options[option].people?' selected=' + services[id].options[option].people:'');
    let html = '<div class="frame-reservation">' +
    '<div class="reservation">' +
        '<div class="panel" name="people" ' + selected +  '>' +
            '<div class="xtitle">People</div>' +
            '<div style="display:flex;flex-direction: row;">' +
                '<div class="menu-button" onclick="menuButton(this,0,'+ id + ',' + option + ');">1</div>' +
                '<div class="menu-button" onclick="menuButton(this,1,'+ id + ',' + option + ');">2</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction: row;">' +
                '<div class="menu-button" onclick="menuButton(this,2,'+ id + ',' + option + ');">3</div>' +
                '<div class="menu-button" onclick="menuButton(this,3,'+ id + ',' + option + ');">4</div>' +
            '</div>' +
            '<div>' +
                '<div class="comment">(Ask for more people)</div>' +
            '</div>' +
        '</div>' +
        '<div class="panel" name="time">' +
            '<div class="xtitle">Time</div>' +
            '<div class="menu-button" id="id-now-button" onclick="menuButton(this,0,'+ id + ',' + option + ');">' + (percent==100?'Next':'Now') + '</div>' +
            '<div class="menu-button" onclick="menuButton(this,1,'+ id + ',' + option + ');">Today</div>' +
            '<div class="menu-button" onclick="menuButton(this,2,'+ id + ',' + option + ');">Tomorrow</div>' +
        '</div>';

    html += renderHours(id,option).outerHTML;

    html += '</div>' +
    '<div class="panel" style="display:flex; flex-direction:row; justify-content: flex-end;">' +
        '<div class="menu-button" id="idReserveButton" style="height:15px;" onclick="reserve(' + id + ',' + option + ');">Reserve</div>' +
    '</div>' +
    '</div>';

    let div = document.createElement('div');
    div.innerHTML = html;
    let panel = div.getElementsByClassName('panel');
    panel[0].setAttribute('selected',services[id].options[option].people);
    panel[1].setAttribute('selected',services[id].options[option].time);
    panel[2].setAttribute('selected',services[id].options[option].hour);
    panel[0].getElementsByClassName('menu-button')[services[id].options[option].people].style.backgroundColor = '#ccc';
    panel[1].getElementsByClassName('menu-button')[services[id].options[option].time].style.backgroundColor = '#ccc';
    panel[2].getElementsByClassName('menu-button')[services[id].options[option].hour].style.backgroundColor = '#ccc';


    document.getElementById('id-service-content').innerHTML = div.innerHTML;
    if(services[id].options[option].reserved)
    {
        document.getElementById('idReserveButton').style.backgroundColor = 'tomato';
        document.getElementById('idReserveButton').style.color = 'white';
        document.getElementById('idReserveButton').innerText = 'Cancel';

    }

}
function renderHours(id, option)
{
    let panel = document.createElement('div');
    panel.setAttribute('class', 'panel');
    panel.setAttribute('name', 'hour');
    panel.setAttribute('style', 'display:flex;flex-direction:row;align-items: flex-start;');

    let day = null;
    let night = null;
    let title = null;
    let hour = null;
    let j = 0;
    let available = services[id].options[option].available;

    if(available.day)
    {
        day = document.createElement('div');
        day.setAttribute('style','margin-left:20px;')
        title = document.createElement('div');
        title.setAttribute('class', 'xtitle');
        title.innerText = 'Day';
        day.appendChild(title);
        for(var i=0; i < available.day.length ; i++)
        {
            hour = document.createElement('div');
            hour.setAttribute('class', 'menu-button');
            hour.setAttribute('onclick','menuButton(this,' + j++ + ',' + id + ',' + option +');');
            hour.innerText = available.day[i];
            day.appendChild(hour);
        }
        panel.appendChild(day);
    
    }
    if(available.night)
    {
        night = document.createElement('div');
        night.setAttribute('style','margin-left:20px;')

        title = document.createElement('div');
        title.setAttribute('class', 'xtitle');
        title.innerText = 'Night';
        night.appendChild(title);
        for(var i=0; i < available.night.length ; i++)
        {
            hour = document.createElement('div');
            hour.setAttribute('class', 'menu-button');
            hour.setAttribute('onclick','menuButton(this,' + j++ + ',' + id + ',' + option +');');
            hour.innerText = available.night[i];
            night.appendChild(hour);
        }
        panel.appendChild(night);
    
    }
    return(panel);
}
function menuButton(button, i, id, option)
{
    let panel = null;
    if(button.parentElement.getAttribute('class') === 'panel')
        panel = button.parentElement;
    else
        panel = button.parentElement.parentElement;

    //console.log('panel name', panel.getAttribute('name'));
    //console.log('panel selected', panel.getAttribute('selected'));
    if(panel.getAttribute('selected'))
    {
        sbutton = panel.getElementsByClassName('menu-button')[+panel.getAttribute('selected')];
        sbutton.style.backgroundColor = '#fcfcfc';
    }
    button.style.backgroundColor = '#ccc';
    panel.setAttribute('selected', i);
    //console.log('id', id);
    switch(panel.getAttribute('name'))
    {
        case 'people':
            services[id].options[option].people = i;
            break;
        case 'time':
            services[id].options[option].time = i;
            break;
        case 'hour':
            services[id].options[option].hour = i;
            break;
    }

}
function reserve(id, option)
{
    let percent = Math.round((services[id].capacity.now / services[id].capacity.total)*100);

    let hours = services[id].options[option].available.day.concat(services[id].options[option].available.night);
    let times = ['Now','Today','Tomorrow'];

    let people = services[id].options[option].people + 1;
    let hour = hours[services[id].options[option].hour];
    let time = times[services[id].options[option].time];

    let data = null;
    console.log('people', people);
    console.log('hour', hour);
    console.log('time', time);
    console.log('contact id', state.contact.idContact);
    if(document.getElementById('idReserveButton').innerText === 'Cancel')
    {
        document.getElementById('idReserveButton').style.backgroundColor = '#fcfcfc';
        document.getElementById('idReserveButton').style.color = 'black';
        document.getElementById('idReserveButton').innerText = 'Reserve';
        services[id].options[option].reserved = false;
        data = {
            action : 'notify',
            payload: {
                from:'hotel',
                to:{
                    target:'guest',
                    value: state.contact.idContact
                },
                content: 'text',
                type : 'notification',
                message: {
                    text: services[id].name + ' Reservation Canceled!'
                },
                priority: 'normal',
                severity: 'warning'
            }
        };

     
    } else {
        document.getElementById('idReserveButton').style.backgroundColor = 'tomato';
        document.getElementById('idReserveButton').style.color = 'white';
        document.getElementById('idReserveButton').innerText = 'Cancel';
        services[id].options[option].reserved = true;
        console.log('hour', hour);
        let m = '';
        if(time === 'Now')
        {
            if(percent == 100)
            {
                m = 'You will be notified on the next vacancy.';
            }
            else
            {
                m = 'Reserved';
            }

        }
        else 
        {
            m = 'Reservation ' + time + ' ' + hour
        }
        data = {
            action : 'notify',
            payload: {
                from:'hotel',
                to:{
                    target:'guest',
                    value: state.contact.idContact
                },
                content: 'text',
                type : 'notification',
                message: {
                    text: services[id].name + ' People ' + people + ' ' + m 
                },
                priority: 'normal',
                severity: 'info'
            }
        };
    }
    doSend(data);
}
 