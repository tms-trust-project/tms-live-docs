// $(document).foundation();

const BRANCH_TEMPLATE_STR = "{{ branch }}"

let urlParams = new URLSearchParams(location.search);
let currentBranch = urlParams.get('branch');

class Api {
    constructor(name, urlTemplate, defaultBranch) {
        this.name = name;
        this.urlTemplate = urlTemplate;
        this.defaultBranch = defaultBranch;
    }

    getUrlForCurrentBranch = () => {
        return this.urlTemplate.replace(BRANCH_TEMPLATE_STR, currentBranch || this.defaultBranch)
    }
}

// list of APIS
var apis = [
    {
        name: 'Portal',
        urlTemplate: 'https://raw.githubusercontent.com/tapis-project/tms_portal/refs/heads/master/docs/tms_openapi.yml',
        defaultBranch: "prod",
    },
    {
        name: 'Credential Server',
        urlTemplate: 'https://raw.githubusercontent.com/tms-trust-project/openapi-tms-server/refs/heads/main/tms_server_openapi.yml',
        defaultBranch: "prod",
    },
].map((api) => new Api(api.name, api.urlTemplate, api.defaultBranch));


function init() {
    let service = urlParams.get("service");
    if (!!service) {
        apis.forEach((api) => {
            if (api.name.toLowerCase() == service.toLowerCase()) {
                console.log(`${api.getUrlForCurrentBranch()}`)
                Redoc.init(api.getUrlForCurrentBranch());
            }
        });

        return 
    }

    // initially render first API
    Redoc.init(apis[0].getUrlForCurrentBranch());
}

$(document).ready(function ($) {
    function onClick() {
        var url = this.getAttribute('data-link');
        let serviceName = this.getAttribute('service');
        Redoc.init(url);
        var queryParams = new URLSearchParams(window.location.search);
        queryParams.set("service", serviceName);
        let hashFragment = window.location.hash;
        // Consolidated history management
        updateHistory(queryParams, hashFragment);
    }

    function updateHistory(queryParams, hashFragment) {
        // Construct the new state
        let newState = "?" + queryParams.toString() + hashFragment;

        // Push the new state to history
        history.pushState(null, null, newState);

        //console.log("Updated history state:", newState);
        //console.log("Current history state:", history.state);
    }

    // dynamically building navigation items
    var $list = document.getElementById('links_container');
    apis.forEach(function (api) {
        var $listitem = document.createElement('li');
        $listitem.setAttribute('data-link', api.getUrlForCurrentBranch());
        $listitem.setAttribute('service', api.name);
        $listitem.innerText = api.name;
        $listitem.addEventListener('click', onClick);
        $list.appendChild($listitem);
    });

    var queryParams = new URLSearchParams(window.location.search);
    
    init(queryParams);
    
    $(window).on('popstate', function () {
        // Get parameters before the popstate event
        var beforeService = window.location.search;
        var beforeHash = window.location.hash;

        // Get current parameters after the popstate event
        var afterService = this.location.search;
        var afterHash = this.location.hash;

        //console.log("Service at popstate:", beforeService, " --> ", afterService);
        //console.log("Hash at popstate:", beforeHash, " --> ", afterHash);

        if (beforeService !== afterService || beforeHash !== afterHash) {
            // This history logic helps a bit, but not great.
            Redoc.init(afterService + afterHash); // Initialize with the new query parameters and hash
        }
    });
})

