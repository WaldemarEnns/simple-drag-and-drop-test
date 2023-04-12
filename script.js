// This is not necessarily needed but it makes sure that the JS is running only when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', function () {
    
    // Storing some elements into variables to apply event-handlers to them
    let dragged;
    const draggables = document.querySelectorAll('.draggable');
    const dropzones = document.querySelectorAll('.dropzone');
    const storeDropzonesBtn = document.getElementById('storeDropzones');
    const draggableContainer = document.querySelector('.draggable-container');

    // Adding event-listeners for the numbers that are being dragged
    // This basically just stores the value of the number that is being dragged
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', function (event) {
            dragged = event.target;
            event.dataTransfer.setData('text/plain', event.target.id);
        });

        // Adjusting the styles if wanted, when finishing the dragging
        draggable.addEventListener('dragend', function (event) {
            event.target.style.opacity = '1';
        });
    });

    // Adding event-listeners for the dropzones
    // Some of them just change the color of the dragged number and the dropzone - no further funcitonality
    function setupDropzone(dropzone) {
        // Preventing the default behaviour of the browser
        dropzone.addEventListener('dragover', function (event) {
            event.preventDefault();
        });


        dropzone.addEventListener('dragenter', function (event) {
            // this check makes sure that the dragenter event is only applied on the dropzone
            // and not on the numbers
            // This prevents numbers from being dragged into numbers
            if (!event.target.classList.contains('dropzone') && !event.target.classList.contains('draggable-container')) {
                return;
            }

            event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        });

        dropzone.addEventListener('dragleave', function (event) {
            if (!event.target.classList.contains('dropzone') && !event.target.classList.contains('draggable-container')) {
                return;
            }

            event.target.style.backgroundColor = dropzone.classList.contains('dropzone') ? 'lightgrey' : '';
        });

        // This handler is responsible for the actual dropping of the number
        // It stores a number in a dropzone and removes an existing number from the dropzone, if
        // there is one
        dropzone.addEventListener('drop', function (event) {
            if (!event.target.classList.contains('dropzone') && !event.target.classList.contains('draggable-container')) {
                return;
            }                        

            event.preventDefault();
            event.target.style.backgroundColor = dropzone.classList.contains('dropzone') ? 'lightgrey' : '';

            if (event.target.classList.contains('draggable-container')) {
                event.target.appendChild(dragged);
                dragged.style.width = '50px';
                dragged.style.height = '50px';
                dragged.style.lineHeight = '50px';
            } else {
                // check if there is already a number stored
                const previousElement = event.target.querySelector('.draggable');

                // if there is a number stored, remove it from the dropzone
                // and return it back to the draggable-container, where all the available numbers
                // are stored
                if (previousElement) {
                    const parent = document.querySelector('.draggable-container');
                    previousElement.style.backgroundColor = 'lightblue';
                    parent.appendChild(previousElement);
                }

                // add the dropped number to the dropzone
                event.target.appendChild(dragged);
            }
        });
    }

    // Setup dropzones
    dropzones.forEach(setupDropzone);

    // Setup draggable-container as a dropzone
    setupDropzone(draggableContainer);


    // This handler is responsible for storing the numbers in the dropzones
    // and emitting a POST request to the server
    storeDropzonesBtn.addEventListener('click', function () {
        const dropzoneData = {};
    
        // In this forEach loop, we collect all the drop-zones, and retreive their contents
        dropzones.forEach(dropzone => {
            const number = dropzone.querySelector('.draggable');
            dropzoneData[dropzone.id] = number ? parseInt(number.textContent) : null;
        });

        // The POST request is emitted here
        fetch('/store-dropzones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dropzoneData)
        });
    });
});
