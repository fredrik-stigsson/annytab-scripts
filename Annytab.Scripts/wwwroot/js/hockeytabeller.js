// Initialize when DOM content has been loaded
document.addEventListener('DOMContentLoaded', function () {
    var elements = document.getElementsByClassName('hockeytabeller.se');
    for (var i = 0; i < elements.length; i++) {
        get_statistics(elements[i]);
    }
}, false);

// Get statistics
function get_statistics(element) {
    var type = element.getAttribute('data-type') !== null ? element.getAttribute('data-type') : 'overview';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.hockeytabeller.se/api/groups/get_' + type + '_as_html/' + element.getAttribute('data-group'), true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            element.insertAdjacentHTML('beforeend', xhr.response);
            apply_filter(element);
        }
    };
    xhr.send();

} // End of the get_statistics method

// Apply a filter
function apply_filter(element) {

    // Get filter
    var filter = element.getAttribute('data-filter') !== null ? element.getAttribute('data-filter').split(',') : [];

    if (filter.length > 0) {

        // Get all team containers
        var teams = element.getElementsByClassName('annytab-ht-team-container');

        // Loop teams
        for (var i = 0; i < teams.length; i++) {
            if (!filter.includes(teams[i].getAttribute('data-team'))) {
                teams[i].style.display = "none";
            }
        }
    }

} // End of the apply_filter method