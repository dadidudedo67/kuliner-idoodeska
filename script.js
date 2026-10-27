// SCRIPT.JS - PEMISAHAN MODE KLIK GAMBAR (CHECKOUT) & KLIK KERANJANG

document.addEventListener('DOMContentLoaded', () => {

    // 1. EFEK SCROLL MOUSE & TOUCH UNTUK SCROLLER MENU HORIZONTAL
    const horizontalScrollers = document.querySelectorAll('.horizontal-scroll');

    horizontalScrollers.forEach((scroller) => {
        scroller.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            scroller.scrollLeft += evt.deltaY * 1.5; 

            const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
            
            if (scroller.scrollLeft >= maxScrollLeft - 5 && evt.deltaY > 0) {
                scroller.scrollLeft = 0;
            } else if (scroller.scrollLeft <= 0 && evt.deltaY < 0) {
                scroller.scrollLeft = maxScrollLeft;
            }
        });

        let touchStartX = 0;
        let scrollStartLeft = 0;

        scroller.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            scrollStartLeft = scroller.scrollLeft;
        }, { passive: true });

        scroller.addEventListener('touchmove', (e) => {
            const touchCurrentX = e.touches[0].clientX;
            const distanceX = touchStartX - touchCurrentX;
            scroller.scrollLeft = scrollStartLeft + distanceX;

            const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

            if (scroller.scrollLeft >= maxScrollLeft - 2) {
                scroller.scrollLeft = 0;
                touchStartX = touchCurrentX;
                scrollStartLeft = scroller.scrollLeft;
            } else if (scroller.scrollLeft <= 2) {
                scroller.scrollLeft = maxScrollLeft;
                touchStartX = touchCurrentX;
                scrollStartLeft = scroller.scrollLeft;
            }
        }, { passive: true });
    });

    // 2. EFEK PERUBAHAN NAVBAR SAAT DI-SCROLL
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // 3. TOGGLE HAMBURGER MENU (MOBILE)
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // 4. SISTEM KERANJANG & CHECKOUT LANGSUNG
    let cart = {};

    const cartNavBtn = document.getElementById('cartNavBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const directOrderNavBtn = document.getElementById('directOrderNavBtn');
    const directCheckoutModal = document.getElementById('directCheckoutModal');
    const closeDirectModal = document.getElementById('closeDirectModal');
    const directOrderForm = document.getElementById('directOrderForm');

    // Buka Modal Keranjang dari Navbar
    cartNavBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
        renderCart();
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('active');
    });

    // Buka Form Pesan Langsung dari Navbar
    directOrderNavBtn.addEventListener('click', () => {
        directCheckoutModal.classList.add('active');
    });

    closeDirectModal.addEventListener('click', () => {
        directCheckoutModal.classList.remove('active');
    });

    directCheckoutModal.addEventListener('click', (e) => {
        if (e.target === directCheckoutModal) directCheckoutModal.classList.remove('active');
    });

    // Pengaturan Setiap Kartu Menu
    document.querySelectorAll('.menu-card').forEach(card => {
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseInt(card.getAttribute('data-price'));
        const addBtn = card.querySelector('.add-btn'); // Tombol Keranjang (+)
        const imgBox = card.querySelector('.menu-img-box'); // Bagian Gambar Menu

        // A. Jika Tombol Keranjang (+) diklik -> Masuk Keranjang & Indikator Bertambah
        if (addBtn) {
            addBtn.innerHTML = '🛒 +'; // Ubah teks tombol agar jelas ada lambang keranjangnya
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(id, name, price, card);
            });
        }

        // B. Jika GAMBAR MENU diklik -> Langsung Buka Mode Checkout (Form Pesan Langsung)
        if (imgBox) {
            imgBox.style.cursor = 'pointer';
            imgBox.addEventListener('click', () => {
                // Masukkan item yang diklik secara otomatis ke data sementara untuk checkout langsung
                cart[id] = { name, price, qty: 1 };
                updateCartBadge();
                
                // Langsung buka modal form checkout (bukan modal keranjang)
                directCheckoutModal.classList.add('active');
                
                // Isi otomatis nama pemesan di form jika mau, atau biarkan kosong
                document.getElementById('orderAddress').value = `Pesanan Langsung (Foto diklik): ${name}`;
            });
        }
    });

    function addToCart(id, name, price, card) {
        if (!cart[id]) {
            cart[id] = { name, price, qty: 1 };
        } else {
            cart[id].qty++;
        }
        updateCardUI(card, id);
        updateCartBadge();
    }

    function updateCardUI(card, id) {
        const actionArea = card.querySelector('.card-footer-action div:last-child');
        if (!card.querySelector('.card-qty-control')) {
            const currentBtn = card.querySelector('.add-btn');
            if (currentBtn) currentBtn.remove();

            const qtyDiv = document.createElement('div');
            qtyDiv.className = 'card-qty-control';
            qtyDiv.innerHTML = `
                <button class="minus-card-btn">-</button>
                <span class="card-qty-num">${cart[id].qty}</span>
                <button class="plus-card-btn">+</button>
            `;
            actionArea.appendChild(qtyDiv);

            qtyDiv.querySelector('.minus-card-btn').addEventListener('click', () => {
                cart[id].qty--;
                if (cart[id].qty <= 0) {
                    delete cart[id];
                    qtyDiv.remove();
                    recreateAddButton(card, id);
                } else {
                    qtyDiv.querySelector('.card-qty-num').innerText = cart[id].qty;
                }
                updateCartBadge();
            });

            qtyDiv.querySelector('.plus-card-btn').addEventListener('click', () => {
                cart[id].qty++;
                qtyDiv.querySelector('.card-qty-num').innerText = cart[id].qty;
                updateCartBadge();
            });
        } else {
            card.querySelector('.card-qty-num').innerText = cart[id].qty;
        }
    }

    function recreateAddButton(card, id) {
        const actionArea = card.querySelector('.card-footer-action div:last-child');
        const newAddBtn = document.createElement('button');
        newAddBtn.className = 'add-btn';
        newAddBtn.innerHTML = '🛒 +';
        actionArea.appendChild(newAddBtn);

        newAddBtn.addEventListener('click', () => {
            const name = card.getAttribute('data-name');
            const price = parseInt(card.getAttribute('data-price'));
            addToCart(id, name, price, card);
        });
    }

    // Sinkronisasi Indikator Angka di Pojok Kanan Atas (0 jadi 1, dst)
    function updateCartBadge() {
        let sum = 0;
        for (let key in cart) {
            sum += cart[key].qty;
        }
        cartCountBadge.innerText = sum;
    }

    function renderCart() {
        cartItemsList.innerHTML = '';
        let keys = Object.keys(cart);
        if (keys.length === 0) {
            cartItemsList.innerHTML = `<p class="empty-cart-text">Keranjang masih kosong. Yuk pilih menu favoritmu!</p>`;
            cartTotalPrice.innerText = 'Rp 0';
            return;
        }

        let grandTotal = 0;
        keys.forEach(id => {
            let item = cart[id];
            let itemTotal = item.price * item.qty;
            grandTotal += itemTotal;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>Rp ${item.price.toLocaleString('id-ID')}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn modal-minus" data-id="${id}">-</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button class="qty-btn modal-plus" data-id="${id}">+</button>
                </div>
            `;
            cartItemsList.appendChild(row);
        });

        cartTotalPrice.innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;

        cartItemsList.querySelectorAll('.modal-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let id = e.target.getAttribute('data-id');
                cart[id].qty--;
                if (cart[id].qty <= 0) {
                    delete cart[id];
                    resetCardUIState(id);
                }
                updateCartBadge();
                renderCart();
            });
        });

        cartItemsList.querySelectorAll('.modal-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let id = e.target.getAttribute('data-id');
                cart[id].qty++;
                updateCartBadge();
                renderCart();
            });
        });
    }

    function resetCardUIState(id) {
        document.querySelectorAll('.menu-card').forEach(card => {
            if (card.getAttribute('data-id') === id) {
                const qtyCtrl = card.querySelector('.card-qty-control');
                if (qtyCtrl) {
                    qtyCtrl.remove();
                    recreateAddButton(card, id);
                }
            }
        });
    }

    // Tombol Lanjut dari Keranjang ke Form Checkout
    checkoutBtn.addEventListener('click', () => {
        let keys = Object.keys(cart);
        if (keys.length === 0) {
            alert('Keranjang Anda masih kosong!');
            return;
        }
        cartModal.classList.remove('active');
        directCheckoutModal.classList.add('active');
    });

    // Kirim Pesanan Langsung ke WhatsApp Kamu (Nomor: 6288905682258)
    directOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let keys = Object.keys(cart);
        if (keys.length === 0) {
            alert('Silakan pilih minimal 1 menu terlebih dahulu!');
            directCheckoutModal.classList.remove('active');
            return;
        }

        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const type = document.getElementById('orderType').value;
        const table = document.getElementById('orderTable').value || '-';
        const address = document.getElementById('orderAddress').value || '-';

        let message = `🔔 *PESANAN BARU IDOODESKA* 🔔\n\n`;
        message += `👤 *Nama Pemesan:* ${name}\n`;
        message += `📱 *No HP/WA:* ${phone}\n`;
        message += `🍽️ *Tipe:* ${type}\n`;
        message += `📍 *No Meja / Info:* ${table}\n`;
        message += `📝 *Catatan:* ${address}\n\n`;
        message += `----------------------------------\n`;
        message += `📋 *Rincian Pesanan:* \n`;

        let grandTotal = 0;
        keys.forEach(id => {
            let item = cart[id];
            let subtotal = item.price * item.qty;
            grandTotal += subtotal;
            message += `• ${item.name} (${item.qty}x) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
        });

        message += `----------------------------------\n`;
        message += `💰 *Total Pembayaran: Rp ${grandTotal.toLocaleString('id-ID')}*\n\n`;
        message += `✓ Pesanan berhasil dikirim dari web IDOODESKA. Mohon segera diproses ya!`;

        let waNumber = "6288905682258"; // Nomor WhatsApp kamu
        let waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(waUrl, '_blank');
        directCheckoutModal.classList.remove('active');
    });

    // 5. PENANGANAN FORM RESERVASI MEJA
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            alert(`Terima kasih, ${name}! Reservasi meja Anda di IDOODESKA berhasil terkirim.`);
            reservationForm.reset();
        });
    }

});
