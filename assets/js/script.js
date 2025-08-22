let selectedTags = new Set(); // Track selected tags
let tagsJSON = {}; // Store Tags JSON
let dataJSON = []; // Store Lists JSON

// Event listener for load JSON
document.addEventListener("DOMContentLoaded", () => {
    loadJSON('assets/data/tags.json', (data) => {
        if (data) {
            tagsJSON = data;
            generateFilter();
        }
    });

    loadJSON('assets/data/data.json', (data) => {
        if (Array.isArray(data)) {
            dataJSON = data;
            generateList();
        }
    });
});

// Load JSON files
function loadJSON(url, callback) {
    fetch(url)
        .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! Status: ${response.status}`))
        .then(callback)
        .catch(error => console.error('Error loading JSON:', error));
}

// Capitalize words/sentence
function capitalize(phrase) {
    return phrase
        .replace(/_/g, ' ')
        .split(" ") 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Clean URL
function cleanURL(url) {
    const maxLength = 45;
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/+$/, '');

    if (cleanUrl.length <= maxLength) return cleanUrl;

    // Trim URL
    const start = cleanUrl.slice(0, 15);
    const end = cleanUrl.slice(-10);

    return `${start}...${end}`;
}

// Generate list
function generateList() {
    const dataList = document.getElementById('dataList');

    dataList.innerHTML = '';
    let counter = 0;

    dataJSON.forEach(function(item) {
        let listItem = document.createElement('div');
        listItem.classList.add('list-item');

        // Title
        let title = document.createElement('div');
        title.classList.add('title');
        title.textContent = item.name;

        // Description
        let description = document.createElement('div');
        description.classList.add('text-muted', 'description');
        description.textContent = item.description;

        // Read More
        let read_more = document.createElement('span');
        read_more.classList.add('read-more');
        read_more.textContent = "Read More";

        // Link
        let source = document.createElement('a');
        source.href = item.url;
        source.target = "_blank";
        source.textContent = cleanURL(item.url);

        // Filters
        let filters = document.createElement('div');
        filters.classList.add('d-flex', 'flex-wrap');

        if (Array.isArray(item.techniques)) {
            item.techniques.forEach(function(itemTechnique) {
                let technique = document.createElement('span');
                technique.classList.add('alert', 'alert-primary');
                technique.setAttribute('data-tag', itemTechnique);
                technique.textContent = capitalize(itemTechnique);
                filters.appendChild(technique);
            });
        }

        if (Array.isArray(item.categories)) {
            item.categories.forEach(function(itemcategory) {
                let category = document.createElement('span');
                category.classList.add('alert', 'alert-success');
                category.setAttribute('data-tag', itemcategory);
                category.textContent = capitalize(itemcategory);
                filters.appendChild(category);
            });
        }

        if (Array.isArray(item.targets)) {
            item.targets.forEach(function(itemTarget) {
                let target = document.createElement('span');
                target.classList.add('alert', 'alert-dark');
                target.setAttribute('data-tag', itemTarget);
                target.textContent = capitalize(itemTarget);
                filters.appendChild(target);
            });
        }

        listItem.appendChild(title);
        listItem.appendChild(description);
        listItem.appendChild(read_more);
        listItem.appendChild(source);
        listItem.appendChild(filters);
        dataList.appendChild(listItem);
        counter++;
    });

    document.getElementById("counter").textContent = --counter;

    addReadMoreBtns();
}

// Generate filters
function generateFilter() {
    const filterList = document.getElementById('filters');

    filterList.innerHTML = '';

    // Techniques
    let technique = document.createElement('div');
    technique.classList.add('filter-item');

    let techniqueTitle = document.createElement('div');
    techniqueTitle.classList.add('title');
    techniqueTitle.textContent = "Techniques";

    let techniqueBtn = document.createElement('div');

    tagsJSON['techniques'].forEach(item => {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        btn.setAttribute('data-tag', item);
        btn.textContent = capitalize(item);

        btn.addEventListener('click', function () {
            toggleTagFilter(btn, item);
        });

        techniqueBtn.appendChild(btn);
    });

    technique.appendChild(techniqueTitle);
    technique.appendChild(techniqueBtn);

    // Categories
    let category = document.createElement('div');
    category.classList.add('filter-item');

    let categoryTitle = document.createElement('div');
    categoryTitle.classList.add('title');
    categoryTitle.textContent = "Categories";

    let categoryBtn = document.createElement('div');

    tagsJSON['categories'].forEach(item => {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn', 'btn-outline-success', 'btn-sm');
        btn.setAttribute('data-tag', item);
        btn.textContent = capitalize(item);

        btn.addEventListener('click', function () {
            toggleTagFilter(btn, item);
        });

        categoryBtn.appendChild(btn);
    });

    category.appendChild(categoryTitle);
    category.appendChild(categoryBtn);

    // Targets
    let target = document.createElement('div');
    target.classList.add('filter-item');

    let targetTitle = document.createElement('div');
    targetTitle.classList.add('title');
    targetTitle.textContent = "Targets";

    let targetBtn = document.createElement('div');

    tagsJSON['targets'].forEach(item => {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
        btn.setAttribute('data-tag', item);
        btn.textContent = capitalize(item);

        btn.addEventListener('click', function () {
            toggleTagFilter(btn, item);
        });

        targetBtn.appendChild(btn);
    });

    target.appendChild(targetTitle);
    target.appendChild(targetBtn);

    // Reset Btn
    let resetBtn = document.createElement('div');
    let btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('btn', 'btn-dark', 'btn-sm', 'mt-2');
    btn.setAttribute('data-tag', 'reset');
    btn.textContent = "RESET";
    btn.addEventListener('click', function () {
        toggleTagFilter(btn, 'reset');
    });
    resetBtn.appendChild(btn);

    // Append filters to filterList
    filterList.appendChild(technique);
    filterList.appendChild(category);
    filterList.appendChild(target);
    filterList.appendChild(resetBtn);
}

// Filter list items based on search and selected tags
function filterItems() {
    let searchFilter = document.getElementById('search').value.trim().toLowerCase();
    let listItems = document.querySelectorAll('.list-item');

    listItems.forEach(item => {
        let title = item.querySelector('.title').textContent.toLowerCase();
        let tags = Array.from(item.querySelectorAll('[data-tag]')).map(tag => tag.getAttribute('data-tag'));
        
        let matchesSearch = title.includes(searchFilter);
        let matchesTags = selectedTags.size === 0 || Array.from(selectedTags).some(tag => tags.includes(tag));

        item.style.display = matchesSearch && matchesTags ? 'block' : 'none';
    });
}

// Event listener for search filter
document.getElementById('search').addEventListener('input', function () {
    filterItems();
});

// Event listener for filter btns
function toggleTagFilter(button, tag) {
    if (tag === 'reset') {
        selectedTags.clear();
        document.querySelectorAll('button[data-tag]').forEach(btn => btn.classList.remove('active'));
        document.getElementById("search").value = "";
    } else {
        if (selectedTags.has(tag)) {
            selectedTags.delete(tag);
            button.classList.remove('active');
        } else {
            selectedTags.add(tag);
            button.classList.add('active');
        }
    }
    filterItems();
}

// Read More btns
function addReadMoreBtns() {
    document.getElementById('dataList').addEventListener('click', event => {
        if (event.target.classList.contains('read-more')) {
            let description = event.target.previousElementSibling;
            description.classList.add('expanded');
            event.target.classList.add('d-none');
            event.stopPropagation();
        }
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.description.expanded').forEach(desc => desc.classList.remove('expanded'));
        document.querySelectorAll('.read-more.d-none').forEach(btn => btn.classList.remove('d-none'));
    });
}