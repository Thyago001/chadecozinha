// Data Storage (in-memory)
const appData = {
    rsvps: [],
    gifts: {},
    adminPassword: '123'
};

// Gift Registry Data (ordenado alfabeticamente)
const giftRegistry = {
    'Presentes': [
        'Abridor de garrafa',
        'Abridor de lata',
        'Assadeira',
        'Avental',
        'Açucareiro',
        'Bacia',
        'Balde',
        'Cesto de roupa',
        'Cestinho de pão',
        'Chaleira',
        'Colher de cozinha',
        'Concha pequena',
        'Conjunto de pregadores',
        'Cortador de bolo',
        'Cortina de cozinha',
        'Cortina',
        'Cuscuzeira',
        'Descascador de legumes',
        'Escova para limpeza',
        'Escorredor de louça',
        'Escorredor de macarrão',
        'Espátula',
        'Espremedor de laranja',
        'Faca de carne',
        'Faca de pão',
        'Ferro de passar',
        'Forma de bolo',
        'Forma de gelo',
        'Forminhas pequenas',
        'Fouet (batedor manual)',
        'Frigideira',
        'Fruteira',
        'Funil',
        'Galheteiro',
        'Garrafa de café',
        'Jarra',
        'Jogo americano',
        'Jogo de copos',
        'Jogo de Panelas',
        'Jogo de xícaras',
        'Jogos de facas',
        'Kit de Utencilios de Cozinha',
        'Liquidificador',
        'Leiteira',
        'Lixeira de pia',
        'Mantegueira',
        'Outros... (Digite junto do seu nome)',
        'Panela de pressão',
        'Pano de chão',
        'Pano de prato',
        'Paninhos multiuso',
        'Pegador de massa',
        'Pegadores simples',
        'Petisqueira',
        'Pirex',
        'Pote para café e açúcar',
        'Porta mantimentos',
        'Porta-ovos',
        'Porta-tempero',
        'Prato para bolo',
        'Processador de alho',
        'Ralador',
        'Rodo de pia',
        'Rodo e pá',
        'Roupa de cama',
        'Saboneteira',
        'Sanduicheira',
        'Suporte para detergente e esponja',
        'Talheres',
        'Tapete de banheiro',
        'Tapué (pote plástico)',
        'Tábua de carne',
        'Travesseiros',
        'Toalha de mesa',
        'Tigela',
        'Varal de roupa íntima',
        'Vassoura',
    ]
};

// Initialize gifts in appData
Object.keys(giftRegistry).forEach(category => {
    giftRegistry[category].forEach(gift => {
        appData.gifts[gift] = { reserved: false, reservedBy: null };
    });
});

// Image upload (invite photo) — preview and localStorage persistence
const inviteInput = document.getElementById('inviteImageInput');
const invitePreview = document.getElementById('inviteImagePreview');
const inviteRemoveBtn = document.getElementById('inviteImageRemove');

function loadInviteImage() {
    try {
        const data = localStorage.getItem('inviteImageData');
        if (data && invitePreview) {
            invitePreview.src = data;
            invitePreview.style.display = 'block';
            const placeholder = document.querySelector('.photo-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        }
    } catch (e) { console.warn('loadInviteImage error', e); }
}

if (inviteInput) {
    inviteInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = reader.result;
                if (invitePreview) {
                    invitePreview.src = data;
                    invitePreview.style.display = 'block';
                }
                localStorage.setItem('inviteImageData', data);
                const placeholder = document.querySelector('.photo-placeholder');
                if (placeholder) placeholder.style.display = 'none';
            } catch (err) { console.warn('invite load err', err); }
        };
        reader.readAsDataURL(file);
    });
}

if (inviteRemoveBtn) {
    inviteRemoveBtn.addEventListener('click', () => {
        localStorage.removeItem('inviteImageData');
        if (invitePreview) {
            invitePreview.src = '';
            invitePreview.style.display = 'none';
        }
        const placeholder = document.querySelector('.photo-placeholder');
        if (placeholder) placeholder.style.display = 'block';
        if (inviteInput) inviteInput.value = '';
    });
}

// Load any saved invite image
loadInviteImage();

// ---- Firebase Realtime Database integration (optional) ----
let database = null;
if (window.firebase && window.firebase.database) {
    try {
        if (window.firebaseConfig && Object.keys(window.firebaseConfig).length > 0) {
            try {
                firebase.initializeApp(window.firebaseConfig);
            } catch (err) {
                // ignore if already initialized
            }
        }
        database = firebase.database();

        const rsvpsRef = database.ref('rsvps');
        const giftsRef = database.ref('gifts');

        // Keep RSVPs in sync
        rsvpsRef.on('value', snapshot => {
            const val = snapshot.val();
            appData.rsvps = val ? Object.values(val) : [];
            renderGiftList();
            renderAdminData();
        });

        // Keep gifts in sync (we store gifts keyed by encodeURIComponent(name))
        giftsRef.on('value', snapshot => {
            const val = snapshot.val();

            // reset gifts to default (not reserved)
            Object.keys(appData.gifts).forEach(g => {
                appData.gifts[g] = { reserved: false, reservedBy: null };
            });

            if (val) {
                Object.entries(val).forEach(([key, data]) => {
                    const giftName = decodeURIComponent(key);
                    appData.gifts[giftName] = {
                        reserved: !!data.reserved,
                        reservedBy: data.reservedBy || null
                    };
                });
            }

            renderGiftList();
            renderAdminData();
        });
    } catch (e) {
        console.warn('Firebase init error:', e);
        database = null;
    }
}
// ------------------------------------------------------------

// Music Control
const music = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
let isPlaying = false;

musicToggle.addEventListener('click', () => {
    if (isPlaying) {
        music.pause();
        musicToggle.classList.add('paused');
        isPlaying = false;
    } else {
        music.play().catch(e => console.log('Music play error:', e));
        musicToggle.classList.remove('paused');
        isPlaying = true;
    }
});

// Auto-play music on user interaction
document.addEventListener('click', () => {
    if (!isPlaying) {
        music.play().catch(e => console.log('Music play error:', e));
        musicToggle.classList.remove('paused');
        isPlaying = true;
    }
}, { once: true });

// RSVP Form
const rsvpForm = document.getElementById('rsvpForm');
const rsvpConfirmation = document.getElementById('rsvpConfirmation');

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const guestName = document.getElementById('guestName').value;
    const guestCount = document.getElementById('guestCount').value;
    
    // Add to data
    const rsvpObj = {
        name: guestName,
        count: parseInt(guestCount),
        timestamp: new Date().toISOString()
    };

    if (database) {
        const newRef = database.ref('rsvps').push();
        newRef.set(rsvpObj);
    } else {
        appData.rsvps.push(rsvpObj);
    }
    
    // Show confirmation
    rsvpConfirmation.innerHTML = `
        <p>✓ Presença confirmada com sucesso!</p>
        <p><strong>${guestName}</strong> - ${guestCount} pessoa(s)</p>
    `;
    rsvpConfirmation.style.display = 'block';
    
    // Reset form
    rsvpForm.reset();
    
    // Hide confirmation after 5 seconds
    setTimeout(() => {
        rsvpConfirmation.style.display = 'none';
    }, 5000);
});

// Render Gift List
function renderGiftList() {
    const giftListContainer = document.getElementById('giftList');
    giftListContainer.innerHTML = '';
    
    Object.keys(giftRegistry).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'gift-category';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);
        
        const giftGrid = document.createElement('div');
        giftGrid.className = 'gift-grid';
        
        giftRegistry[category].forEach(gift => {
            const giftItem = document.createElement('div');
            giftItem.className = 'gift-item';
            
            const giftData = appData.gifts[gift];
            if (giftData.reserved) {
                giftItem.classList.add('reserved');
            }
            
            const giftName = document.createElement('span');
            giftName.className = 'gift-name';
            giftName.textContent = gift;
            
            const giftStatus = document.createElement('span');
            giftStatus.className = 'gift-status';
            giftStatus.textContent = giftData.reserved ? '✓' : '○';
            
            giftItem.appendChild(giftName);
            giftItem.appendChild(giftStatus);
            
            // Add click handler for non-reserved gifts
            if (!giftData.reserved) {
                giftItem.addEventListener('click', () => {
                    openGiftModal(gift);
                });
            }
            
            giftGrid.appendChild(giftItem);
        });
        
        categoryDiv.appendChild(giftGrid);
        giftListContainer.appendChild(categoryDiv);
    });

    // Mensagem gentil ao final da lista de presentes
    const noteDiv = document.createElement('div');
    noteDiv.className = 'gift-note';
    noteDiv.innerHTML = `
        <h4>Uma observação carinhosa</h4>
        <p>Se desejar presentear com algo que não esteja nesta lista, fique à vontade para escolher outro presente — o que realmente importa para nós é o carinho e a presença de cada um! Que Deus abençoe a cada pessoa pelo amor e cuidado.</p>
    `;
    giftListContainer.appendChild(noteDiv);
}

// Gift Modal
const giftModal = document.getElementById('giftModal');
const modalClose = document.getElementById('modalClose');
const modalGiftName = document.getElementById('modalGiftName');
const giftReservationForm = document.getElementById('giftReservationForm');
let currentGift = null;

function openGiftModal(gift) {
    currentGift = gift;
    modalGiftName.textContent = gift;
    giftModal.classList.add('active');
}

// Ensure the form is visible when opening the modal
const _origOpenGiftModal = openGiftModal;
// Replace openGiftModal with a version that also shows the form
function openGiftModal(gift) {
    currentGift = gift;
    if (modalGiftName) modalGiftName.textContent = gift;
    if (giftReservationForm) giftReservationForm.style.display = '';
    giftModal.classList.add('active');
}

function closeGiftModal() {
    giftModal.classList.remove('active');
    giftReservationForm.reset();
    currentGift = null;
}

modalClose.addEventListener('click', closeGiftModal);

giftModal.addEventListener('click', (e) => {
    if (e.target === giftModal) {
        closeGiftModal();
    }
});

giftReservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const reservationName = document.getElementById('reservationName').value;
    
    // Reserve the gift
    if (database) {
        const key = encodeURIComponent(currentGift);
        // capture currentGift before any reset
        const reservedGiftName = currentGift;
        database.ref('gifts/' + key).set({ reserved: true, reservedBy: reservationName })
        .then(() => {
            // Show confirmation inside the modal (do not clear currentGift yet)
            if (modalGiftName) {
                modalGiftName.innerHTML = `\n                    <p>✓ Presente reservado com sucesso!</p>\n                    <p><strong>${reservedGiftName}</strong> - reservado por ${reservationName}</p>\n                `;
            }
            // hide the form while showing confirmation
            if (giftReservationForm) giftReservationForm.style.display = 'none';

            // After 3 seconds close modal and refresh
            setTimeout(() => {
                closeGiftModal();
                renderGiftList();
            }, 3000);
        })
        .catch(err => {
            console.error('Gift reservation error:', err);
            alert('Erro ao reservar o presente. Tente novamente.');
        });
    } else {
        // Fallback: update in-memory and show confirmation in modal (instead of alert)
        const reservedGiftName = currentGift;
        appData.gifts[reservedGiftName] = {
            reserved: true,
            reservedBy: reservationName
        };
        if (modalGiftName) {
            modalGiftName.innerHTML = `\n                <p>✓ Presente reservado com sucesso!</p>\n                <p><strong>${reservedGiftName}</strong> - reservado por ${reservationName}</p>\n            `;
        }
        if (giftReservationForm) giftReservationForm.style.display = 'none';
        setTimeout(() => {
            closeGiftModal();
            renderGiftList();
        }, 3000);
    }
});

// Admin Modal
const adminModal = document.getElementById('adminModal');
const adminBtn = document.getElementById('adminBtn');
const adminModalClose = document.getElementById('adminModalClose');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLogin = document.getElementById('adminLogin');
const adminContent = document.getElementById('adminContent');
const adminError = document.getElementById('adminError');

adminBtn.addEventListener('click', () => {
    adminModal.classList.add('active');
    adminLogin.style.display = 'block';
    adminContent.style.display = 'none';
    adminLoginForm.reset();
    adminError.style.display = 'none';
});

adminModalClose.addEventListener('click', () => {
    adminModal.classList.remove('active');
});

adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.classList.remove('active');
    }
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    if (password === appData.adminPassword) {
        adminLogin.style.display = 'none';
        adminContent.style.display = 'block';
        renderAdminData();
    } else {
        adminError.textContent = 'Senha incorreta!';
        adminError.style.display = 'block';
    }
});

function renderAdminData() {
    // Render RSVPs
    const adminRsvpList = document.getElementById('adminRsvpList');
    adminRsvpList.innerHTML = '';
    
    if (appData.rsvps.length === 0) {
        adminRsvpList.innerHTML = '<div class="empty-state">Nenhuma confirmação ainda</div>';
    } else {
        let totalGuests = 0;
        appData.rsvps.forEach(rsvp => {
            totalGuests += rsvp.count;
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <strong>Nome:</strong> ${rsvp.name}<br>
                <strong>Quantidade:</strong> ${rsvp.count} pessoa(s)<br>
                <strong>Data:</strong> ${new Date(rsvp.timestamp).toLocaleString('pt-BR')}
            `;
            adminRsvpList.appendChild(item);
        });
        
        const totalDiv = document.createElement('div');
        totalDiv.className = 'admin-total';
        totalDiv.innerHTML = `
            Total de Confirmações: ${appData.rsvps.length}<br>
            Total de Convidados: ${totalGuests}
        `;
        adminRsvpList.appendChild(totalDiv);
    }
    
    // Render Gift Reservations
    const adminGiftList = document.getElementById('adminGiftList');
    adminGiftList.innerHTML = '';
    
    const reservedGifts = Object.entries(appData.gifts).filter(([_, data]) => data.reserved);
    
    if (reservedGifts.length === 0) {
        adminGiftList.innerHTML = '<div class="empty-state">Nenhum presente reservado ainda</div>';
    } else {
        reservedGifts.forEach(([gift, data]) => {
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <strong>Presente:</strong> ${gift}<br>
                <strong>Reservado por:</strong> ${data.reservedBy}
            `;
            adminGiftList.appendChild(item);
        });
        
        const totalDiv = document.createElement('div');
        totalDiv.className = 'admin-total';
        totalDiv.textContent = `Total de Presentes Reservados: ${reservedGifts.length}`;
        adminGiftList.appendChild(totalDiv);
    }
}

// Initialize
renderGiftList();

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});