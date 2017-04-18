const Controls = {
    isMenuOpened: false,
    hamburger: document.getElementById('btn-hamburger'),
    menu: document.getElementById('menu'),
    upArrow: document.getElementById('btn-uparrow'),

    show: function(id) {
        const e = document.getElementById(id);
        if(e.classList.contains('hidden')) e.classList.remove('hidden');
        e.classList.add('visible');
    },

    hide: function(id) { 
        const e = document.getElementById(id);
        if(e.classList.contains('visible')) e.classList.remove('visible');
        e.classList.add('hidden');
     },

    toggleMenu: function() {
        if(!Controls.isMenuOpened) {
            Controls.show('menu');
            Controls.hide('btn-uparrow');
            Controls.menu.classList.add('menu-open');
            Controls.hamburger.classList.add('menu-opened');
            Controls.hamburger.classList.remove('menu-closed');
            Controls.isMenuOpened = true;
        }
        else {
            Controls.hide('menu');
            Controls.hamburger.classList.remove('menu-opened');
            Controls.hamburger.classList.add('menu-closed');
            if(window.pageYOffset >= window.innerHeight) Controls.show('btn-uparrow');
            menu.classList.remove('menu-open');
            Controls.isMenuOpened = false;
        }
    },

    navigate: function(id) {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
        if(Controls.isMenuOpened) Controls.toggleMenu();
    },

    handleScroll: function() {
        if(window.pageYOffset >= window.innerHeight && !Controls.isMenuOpened) Controls.show('btn-uparrow');
        else Controls.hide('btn-uparrow');
    },

    init: function() {
        Controls.hamburger.addEventListener('click', Controls.toggleMenu, false);
        [].slice
        .call(Controls.menu.children)
        .forEach((e,i) => {
            e.addEventListener('click', () => {
                if(i == 0) Controls.navigate('intro');
                if(i == 1) Controls.navigate('history');
                if(i == 2) Controls.navigate('interesting');
            });
        });
        Controls.upArrow.addEventListener('click', () => { Controls.navigate('top'); });
    }
}

window.addEventListener('load', Controls.init, false);
window.addEventListener('scroll', Controls.handleScroll, false);