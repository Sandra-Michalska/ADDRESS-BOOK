// Show/hide HTML elements, disable/enable buttons (for adding addresses)
function togglesAdd(addressForm, buttons, text) {
    $('.address-form-add').css('display', addressForm);
    $('.address-form-add__text').css('display', text);
    $('.button-add-address, .button-edit, .button-delete').prop('disabled', buttons);
}

// Show/hide HTML elements, disable/enable buttons (for editing addresses)
function togglesEdit(editedAddress, editedAddressToggle, addressForm, buttons) {
    editedAddress.css('display', editedAddressToggle);
    $('.address-form-edit').css('display', addressForm);
    $('.button-add-address, .button-edit, .button-delete').prop('disabled', buttons);
}

// Show or hide the "Add your first address" text
function firstAddressTextToggle() {
    var textToggle = $('.address-form-add').css('display') == 'block' || $('#address-wrapper').find('.address-div').length ? 'none' : 'block';
    $('.address-form-wrapper__text').css('display', textToggle);
}

// Clear text input fields
function clearFields() {
    $('.add-address-fields').val('');
}

// Display a form for adding addresses
var displayOnce;
function addAddress() {
    displayOnce = 0;
    togglesAdd('block', true, 'none');
    firstAddressTextToggle();
}

// Cancel adding an address
function addAddressCancel() {
    clearFields();
    togglesAdd('none', false, 'none');
    firstAddressTextToggle();
}

// Save an address
function saveAddress(e) {
    var addressData = {
        name: $('#add-address-name').val(),
        phone: $('#add-address-phone').val(),
        address: $('#add-address-address').val()
    }

    if(!addressData.name || !addressData.phone || !addressData.address) {
        if(displayOnce <= 0) {
            togglesAdd('block', true, 'block');
            displayOnce++;
        }
        e.preventDefault();
    } else {
        togglesAdd('none', false, 'none');
        clearFields();
        sendDataToDb(addressData);
    }
}

// Edit an address
var editedAddress;
function editAddress(event) {
    editedAddress = $(event.target).parent();

    var name = $(editedAddress).children('.address-div-name').text();
    var phone = $(editedAddress).children('.address-div-phone').text();
    var address = $(editedAddress).children('.address-div-address').text();

    $('.address-form-edit__name').val(name);
    $('#add-address-phone-edit').val(phone);
    $('#add-address-address-edit').val(address);

    $(editedAddress).before($('.address-form-edit'));
    togglesEdit(editedAddress, 'none', 'block', true);
}

// Save an edited address
function editAddressSave(editedAddress) {
    var dataToUpdate = {
        nameUpdated: $('.address-form-edit__name').val(),
        phoneUpdated: $('#add-address-phone-edit').val(),
        addressUpdated: $('#add-address-address-edit').val(),
        idToUpdate: editedAddress.attr('id')
    };
    updateAddressInDb(dataToUpdate);

    $(editedAddress).children('p.address-div-name').text(dataToUpdate.nameUpdated);
    $(editedAddress).children('p.address-div-phone').text(dataToUpdate.phoneUpdated);
    $(editedAddress).children('p.address-div-address').text(dataToUpdate.addressUpdated);

    togglesEdit(editedAddress, 'block', 'none', false);
}

// Cancel editing an address
function editAddressCancel(editedAddress) {
    togglesEdit(editedAddress, 'block', 'none', false);
}

// Delete an address
function deleteAddress(e) {
    $(e.target).parent().remove();
    var idToDelete = $(e.target).parent().attr('id');
    deleteAddressFromDb(idToDelete);
    firstAddressTextToggle();
}

// Retrieve address data from the server
function getDataFromDb() {
    $.ajax({
        type: 'post',
        url: 'http://localhost:3000/getdata',
        dataType: 'html',
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Ajax error: ' + textStatus + '\n' + errorThrown);
        },
        success: function(serverData) {
            console.log('Ajax success');
            $('#address-wrapper').append(serverData);
            $('.button-edit').on('click', editAddress);
            $('.button-delete').on('click', deleteAddress);
            firstAddressTextToggle();
        }
    });
}

// Send address data to the server
function sendDataToDb(addressData) {
    $.ajax({
        type: 'post',
        url: 'http://localhost:3000/newaddress',
        data: addressData,
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Ajax error: ' + textStatus + '\n' + errorThrown);
        },
        success: function(serverData) {
            console.log('Ajax success');
            $('#address-wrapper').prepend(serverData.templateUpdated);
            var id = '#' + serverData.rowid;
            $(id).children('.button-edit').on('click', editAddress);
            $(id).children('.button-delete').on('click', deleteAddress);
        }
    });
}

// Delete an address from the database
function deleteAddressFromDb(idToDelete) {
    var idToDelete = { idToDelete: idToDelete };

    $.ajax({
        type: 'post',
        url: 'http://localhost:3000/deleteaddress',
        data: idToDelete,
        dataType: 'text',
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Ajax error: ' + textStatus + '\n' + errorThrown);
        },
        success: function(serverData) {
            console.log(serverData);
        }
    });
}

// Update an address in a database
function updateAddressInDb(dataToUpdate) {
    $.ajax({
        type: 'post',
        url: 'http://localhost:3000/updateaddress',
        data: dataToUpdate,
        dataType: 'text',
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Ajax error: ' + textStatus + '\n' + errorThrown);
        },
        success: function(serverData) {
            console.log(serverData);
        }
    });
}

$(document).ready(function() {
    getDataFromDb();
    $('.button-add-address').on('click', addAddress);
    $('.button-save').on('click', saveAddress);
    $('.button-cancel').on('click', addAddressCancel);
    $('.button-edit-save').on('click', function() { editAddressSave(editedAddress); });
    $('.button-edit-cancel').on('click', function() { editAddressCancel(editedAddress); });
});
