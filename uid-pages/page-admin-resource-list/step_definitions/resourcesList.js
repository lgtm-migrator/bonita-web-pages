import { Given as given, Then as then, When as when } from "cypress-cucumber-preprocessor/steps";

const urlPrefix = 'build/dist/';
const url = urlPrefix + 'resources/index.html';
const defaultFilters = '&time=0&d=updatedBy';
const resourceUrl = 'API/portal/page?';
const defaultRequestUrl = urlPrefix + resourceUrl + 'c=10&p=0' + defaultFilters;
const defaultSortOrder = '&o=lastUpdateDate+DESC';

given("The filter response {string} is defined", (filterType) => {
    cy.server();
    switch (filterType) {
        case 'default filter with headers':
            createRouteWithResponseAndHeaders(defaultSortOrder, 'resourcesRoute', 'resources5', {'content-range': '0-4/5'});
        case 'hide provided resources':
            createRoute('&f=isProvided=false' + defaultSortOrder, 'isNotProvidedRoute');
            break;
        case 'content type':
            createRoute('&f=contentType=page' + defaultSortOrder, 'resourcesPagesRoute');
            createRouteWithResponse('&f=contentType=layout' + defaultSortOrder, 'emptyResultRoute', 'emptyResult');
            break;
        case 'sort by':
            createRoute('&o=displayName+ASC', 'sortByNameAscRoute');
            createRoute('&o=displayName+DESC', 'sortByNameDescRoute');
            createRoute('&o=lastUpdateDate+ASC', 'sortByUpdateDateAscRoute');
            break;
        case 'sort during limitation':
            createRouteWithResponseAndHeaders('&o=displayName+DESC', 'sortDisplayNameDescRoute', 'resources10', {'content-range': '0-9/10'});
            createRouteWithResponseAndPagination('&o=displayName+DESC', 'sortDisplayNameDescRoute1', 'resources10', 1, 10);
            createRouteWithResponseAndPagination('&o=displayName+DESC', 'sortDisplayNameDescRoute2', 'resources10', 2, 10);
            break;
        case 'search by name':
            createRoute('&o=lastUpdateDate+DESC&s=ApplicationHomeBonita', 'searchRoute');
            createRouteWithResponse('&o=lastUpdateDate+DESC&s=Search term with no match', 'emptyResultRoute', 'emptyResult');
            break;
        case 'all types of resources':
            createRouteWithResponse(defaultSortOrder, 'allResourcesRoute', 'allResources');
            break;
        case 'file upload':
            cy.intercept('POST', urlPrefix + 'API/pageUpload?action=add', {"filename": "resource.zip","tempPath":"tmp_16316991244937497118.zip","contentType":"application\/zip"});
            break;
        case 'resource installation':
            cy.intercept('POST', urlPrefix + 'API/portal/page', {pageZip: "tmp_16316991244937497118.zip", contentName: "resource.zip"});
            break;
        default:
            throw new Error("Unsupported case");
    }

    function createRoute(queryParameter, routeName) {
        cy.route({
            method: 'GET',
            url: defaultRequestUrl + queryParameter,
        }).as(routeName);
    }

    function createRouteWithResponse(queryParameter, routeName, response) {
        createRouteWithResponseAndPagination(queryParameter, routeName, response, 0, 10);
    }

    function createRouteWithResponseAndHeaders(queryParameter, routeName, response, headers) {
        let responseValue = undefined;
        if (response) {
            cy.fixture('json/' + response + '.json').as(response);
            responseValue = '@' + response;
        }

        cy.route({
            method: 'GET',
            url: defaultRequestUrl + queryParameter,
            response: responseValue,
            headers: headers
        }).as(routeName);
    }

    function createRouteWithResponseAndPagination(queryParameter, routeName, response, page, count) {
        const loadMoreUrl = urlPrefix + resourceUrl + 'c=' + count + '&p=' + page + defaultFilters;
        let responseValue = undefined;
        if (response) {
            cy.fixture('json/' + response + '.json').as(response);
            responseValue = '@' + response;
        }

        cy.route({
            method: 'GET',
            url: loadMoreUrl + queryParameter,
            response: responseValue
        }).as(routeName);
    }
});

given("The {string} is not involved in application response is defined", (resourceType) => {
    let applicationResourceUrl = 'API/';
    let applicationDeleteUrl = 'API/portal/page/';
    switch (resourceType) {
        case 'page':
            applicationResourceUrl+='living/application-page?p=0&c=100&d=applicationId&f=pageId=1';
            applicationDeleteUrl+='1';
            break;
        case 'layout':
            applicationResourceUrl+='living/application?p=0&c=100&f=layoutId=2';
            applicationDeleteUrl+='2';
            break;
        case 'form':
            applicationResourceUrl+='form/mapping?c=100&p=0&d=processDefinitionId&f=pageId=3';
            applicationDeleteUrl+='3';
            break;
        case 'theme':
            applicationResourceUrl+='living/application?p=0&c=100&f=themeId=4';
            applicationDeleteUrl+='4';
            break;
        case 'api extension':
            applicationDeleteUrl+='5';
            break;
        default:
            throw new Error("Unsupported case");
    }
    cy.fixture('json/emptyResult.json').as('emptyResult');
    cy.route({
        method: 'GET',
        url: urlPrefix + applicationResourceUrl,
        response: '@emptyResult'
    }).as("emptyResultRoute");
    cy.route({
        method: 'DELETE',
        url: urlPrefix + applicationDeleteUrl,
        response: '@emptyResult'
    }).as("deletePageRoute");
    cy.route({
        method: 'GET',
        url: urlPrefix + resourceUrl + "c=10&p=0&time=1*&d=updatedBy&o=lastUpdateDate+DESC"
    }).as("refreshListRoute");
});

given("The {string} is involved in application response is defined", (resourceType) => {
    let applicationResourceUrl = 'API/';
    let applicationDeleteUrl = 'API/portal/page/';
    switch (resourceType) {
        case 'page':
            applicationResourceUrl+='living/application-page?p=0&c=100&d=applicationId&f=pageId=1';
            applicationDeleteUrl+='1';
            break;
        case 'layout':
            applicationResourceUrl+='living/application?p=0&c=100&f=layoutId=2';
            applicationDeleteUrl+='2';
            break;
        case 'form':
            applicationResourceUrl+='form/mapping?c=100&p=0&d=processDefinitionId&f=pageId=3';
            applicationDeleteUrl+='3';
            break;
        case 'theme':
            applicationResourceUrl+='living/application?p=0&c=100&f=themeId=4';
            applicationDeleteUrl+='4';
            break;
        default:
            throw new Error("Unsupported case");
    }
    cy.fixture('json/' + resourceType + 'Used.json').as(resourceType + 'Used');
    cy.route({
        method: 'GET',
        url: urlPrefix + applicationResourceUrl,
        response: '@' + resourceType + 'Used'
    }).as(resourceType + "UsedRoute");
});

given("The delete status code {string} response is defined", (statusCode) => {
    let applicationDeleteUrl = 'API/portal/page/1';
    cy.route({
        method: 'DELETE',
        url: urlPrefix + applicationDeleteUrl,
        status: statusCode,
        response: ''
    }).as("deletePageRoute");
});


when("I visit the index page", () => {
    cy.visit(url);
});

when("I visit the resources list page", () => {
    cy.visit(url);
});

when("I put {string} in {string} filter field", (filterValue, filterType) => {
    switch (filterType) {
        case 'content type':
            selectFilterContentTypeOption(filterValue);
            break;
        case 'sort by':
            selectSortByOption(filterValue);
            break;
        case 'search':
            searchForValue(filterValue);
            break;
        default:
            throw new Error("Unsupported case");
    }

    function selectFilterContentTypeOption(filterValue) {
        switch (filterValue) {
            case 'All resources':
                cy.get('select').eq(0).select('0');
                cy.wait('@resourcesRoute');
                break;
            case 'Pages':
                cy.get('select').eq(0).select('1');
                break;
            case 'Layouts':
                cy.get('select').eq(0).select('3');
                break;
            default:
                throw new Error("Unsupported case");
        }
    }

    function selectSortByOption(filterValue) {
        switch (filterValue) {
            case 'Resource name (Asc)':
                cy.get('select').eq(1).select('0');
                break;
            case 'Resource name (Desc)':
                cy.get('select').eq(1).select('1');
                break;
            case 'Updated (Newest first)':
                cy.get('select').eq(1).select('2');
                break;
            case 'Updated (Oldest first)':
                cy.get('select').eq(1).select('3');
                break;
            default:
                throw new Error("Unsupported case");
        }
    }

    function searchForValue(filterValue) {
        cy.get('pb-input input').type(filterValue);
    }
});

when("I erase the search filter", () => {
    cy.get('pb-input input').clear();
});

when("I filter hide provided resources", () => {
    cy.get('.checkbox').click();
});

when("I click on install button in the page", () => {
        cy.get('button').contains('Install').click();
});

when("I click on install button in modal", () => {
    cy.get('.modal-footer button').contains('Install').click();
});

when("I click on close button in the modal", () => {
    cy.get('button').contains('Close').click();
});

when("I click on cancel button in the modal", () => {
    cy.get('button').contains('Cancel').click();
});

when("I click on {string} button on the resource {string}", (iconName, resourceNumber) => {
    cy.get('.action-button-container .glyphicon-' + iconName).eq(resourceNumber - 1).click();
});

when("I click on delete button in modal", () => {
    cy.get('button').contains('Delete').click();
});

when("I click on attach icon", () => {
    cy.get('.modal-body .file-upload .input-group-btn').click();
});

then("The resources have the correct information", () => {
    cy.contains('.item-label-container', 'Resource name').should('be.visible');
    cy.contains('.item-label-container', 'Type').should('be.visible');
    cy.contains('.item-label-container', 'Updated by').should('be.visible');
    cy.contains('.item-label-container', 'Updated on').should('be.visible');
    cy.contains('.item-label-container', 'Actions').should('be.visible');
    cy.get('.resource-item').eq(0).within(() => {
        // Check that the element exist.
        cy.get('.resource-property-value').contains('Page 1');
        cy.get('.resource-property-value').contains('Pages');
        cy.get('.resource-property-value').contains('Walter Bates');
        cy.get('.resource-property-value').contains('12/10/19 2:00 PM');
        cy.get('.glyphicon-info-sign').should('have.attr', 'title', 'Resource token: custompage_userApplication');
    });

    cy.get('.resource-item').eq(1).within(() => {
        // Check that the element exist.
        cy.get('.resource-property-value').contains('Page 2');
        cy.get('.resource-property-value').contains('Pages');
        cy.get('.resource-property-value').contains('helen.kelly');
        cy.get('.resource-property-value').contains('12/10/19 11:29 AM');
        cy.get('.glyphicon-info-sign').should('have.attr', 'title', 'Resource token: custompage_myCustomThemeReadable');
        cy.get('img.is-provided-icon').should('be.visible').should('have.attr', 'src', 'assets/img/bonitasoftLogo.png');
        cy.get('img.is-provided-icon').should('have.attr', 'title', 'Provided');
    });

    cy.get('.resource-item').eq(2).within(() => {
        // Check that the element exist.
        cy.get('.resource-property-value').contains('Page 3');
        cy.get('.resource-property-value').contains('Pages');
        cy.get('.resource-property-value').contains('System');
        cy.get('.resource-property-value').contains('12/10/19 11:29 AM');
        cy.get('img.is-provided-icon').should('be.visible').should('have.attr', 'src', 'assets/img/bonitasoftLogo.png');
        cy.get('img.is-provided-icon').should('have.attr', 'title', 'Provided');
    });

    cy.get('.resource-item').eq(3).within(() => {
        // Check that the element exist.
        cy.get('.resource-property-value').contains('Page 4');
        cy.get('.resource-property-value').contains('Pages');
        cy.get('.resource-property-value').contains('thomas.wallis');
        cy.get('.resource-property-value').contains('12/10/19 11:28 AM');
        cy.get('img.is-provided-icon').should('be.visible').should('have.attr', 'src', 'assets/img/bonitasoftLogo.png');
        cy.get('img.is-provided-icon').should('have.attr', 'title', 'Provided');
    });

    cy.get('.resource-item').eq(4).within(() => {
        cy.get('.resource-property-value').contains('Theme 1');
        cy.get('.resource-property-value').contains('Themes');
        cy.get('.resource-property-value').contains('william.jobs');
        cy.get('.resource-property-value').contains('12/10/19 11:27 AM');
    });
    cy.contains('.text-primary.resource-property-label', 'Resources shown: 5 of 5');
});

then("A list of {string} resources is displayed", (nbrOfResources) => {
    cy.get('.resource-item').should('have.length', nbrOfResources);
});

then("I see only the filtered resources by {string}", (filterType) => {
    switch (filterType) {
        case 'content type':
            cy.wait('@resourcesPagesRoute');
            cy.get('.resource-item').eq(0).within(() => {
                cy.get('.resource-property-value').contains('Page 1');
            });

            cy.get('.resource-item').eq(1).within(() => {
                cy.get('.resource-property-value').contains('Page 2');
            });

            cy.get('.resource-item').eq(2).within(() => {
                cy.get('.resource-property-value').contains('Page 3');
            });

            cy.get('.resource-item').eq(3).within(() => {
                cy.get('.resource-property-value').contains('Page 4');
            });
            break;

        case 'started by me':
            cy.get('.case-item:visible').eq(0).within(() => {
                cy.get('.case-property-value').contains('32001');
                cy.get('.case-property-value').contains('Another My Pool (1.0)');
            });

            cy.get('.case-item:visible').eq(1).within(() => {
                cy.get('.case-property-value').contains('22001');
                cy.get('.case-property-value').contains('Another My Pool (1.0)');
            });

            cy.get('.case-item:visible').eq(2).within(() => {
                cy.get('.case-property-value').contains('12001');
                cy.get('.case-property-value').contains('Another My Pool (1.0)');
            });

            cy.get('.case-item:visible').eq(3).within(() => {
                cy.get('.case-property-value').contains('8008');
                cy.get('.case-property-value').contains('Pool3');
            });
            break;

        default:
            throw new Error("Unsupported case");
    }
});

then("No resources are available", () => {
    cy.get('.resource-item').should('have.length', 0);
    cy.contains('No resources to display').should('be.visible');
});

then("The api call is made for {string}", (filterValue) => {
    switch (filterValue) {
        case 'Updated (Newest first)':
            cy.wait('@resourcesRoute');
            break;
        case 'Updated (Oldest first)':
            cy.wait('@sortByUpdateDateAscRoute');
            break;
        case 'Resource name (Asc)':
            cy.wait('@sortByNameAscRoute');
            break;
        case 'Resource name (Desc)':
            cy.wait('@sortByNameDescRoute');
            break;
        case 'ApplicationHomeBonita':
            cy.wait('@searchRoute');
            break;
        case 'Pages':
            cy.wait('@resourcesPagesRoute');
            break;
        case 'hide provided resources':
            cy.wait('@isNotProvidedRoute');
            break;
        case 'delete page':
            cy.wait('@deletePageRoute');
            break;
        case 'refresh list':
            cy.wait('@refreshListRoute');
            break;
        default:
            throw new Error("Unsupported case");
    }
});

then("The modal {string} button is disabled",(buttonLabel) => {
    cy.get('.modal-footer button').contains(buttonLabel).should('be.disabled');
});

then("The modal is closed",() => {
    cy.get('.modal').should('not.exist');
});

then("The modal delete is displayed for {string}", (resourceName) => {
    cy.get('.modal').contains('Delete ' + resourceName).should('be.visible');
});

then("The resource can be deleted message is displayed", () => {
    cy.get('.modal').contains('This resource is not used in any application.').should('be.visible');
    cy.get('.modal').contains('This resource cannot be deleted because it is used in the following application(s).').should('not.exist');
    cy.get('.modal').contains('This form cannot be deleted because it is used in the following process(es).').should('not.exist');
});

then("The resource cannot be deleted message is displayed", () => {
    cy.get('.modal').contains('This resource cannot be deleted because it is used in the following application(s).').should('be.visible');
    cy.get('.modal').contains('This resource is not used in any application.').should('not.exist');
    cy.get('.modal').contains('This form cannot be deleted because it is used in the following process(es).').should('not.exist');
});

then("The form cannot be deleted message is displayed", () => {
    cy.get('.modal').contains('This form cannot be deleted because it is used in the following process(es).').should('be.visible');
    cy.get('.modal').contains('This resource cannot be deleted because it is used in the following application(s).').should('not.exist');
    cy.get('.modal').contains('This resource is not used in any application.').should('not.exist');
});

then("The api extension can be deleted message is displayed", () => {
    cy.get('.modal').contains('Make sure this REST API extension is not used in any page or form before deletion.').should('be.visible');
    cy.get('.modal').contains('This form cannot be deleted because it is used in the following process(es).').should('not.exist');
    cy.get('.modal').contains('This resource cannot be deleted because it is used in the following application(s).').should('not.exist');
    cy.get('.modal').contains('This resource is not used in any application.').should('not.exist');
});

then("The list of applications using the page is displayed", () => {
    cy.get('.modal').contains('Application as page1').should('be.visible');
    cy.get('.modal').contains('Application 2 as page2').should('be.visible');
});

then("The list of applications using the layout is displayed", () => {
    cy.get('.modal').contains('Application as layout').should('be.visible');
    cy.get('.modal').contains('Application 2 as layout').should('be.visible');
});

then("The list of processes using the form is displayed", () => {
    cy.get('.modal').contains('taskInstance/VacationRequest/1.0/Close').should('be.visible');
    cy.get('.modal').contains('taskInstance/CancelRequest/1.0/Remove').should('be.visible');
});

then("The list of processes using the theme is displayed", () => {
    cy.get('.modal').contains('Application as theme').should('be.visible');
    cy.get('.modal').contains('Application 2 as theme').should('be.visible');
});

then("I see {string} error message", (statusCode) => {
    switch (statusCode) {
        case '500':
            cy.get('.modal').contains('An error has occurred. For more information, check the log file.').should('be.visible');
            break;
        case '404':
            cy.get('.modal').contains('The resource does not exist. Reload the page to see the new list of resources.').should('be.visible');
            break;
        case '403':
            cy.get('.modal').contains('Access denied. For more information, check the log file.').should('be.visible');
            break;
        default:
            throw new Error("Unsupported case");
    }
    cy.get('.modal').contains('The resource has not been deleted.').should('be.visible');
});

then("I don't see any error message", () => {
    cy.get('.modal .glyphicon').should('not.exist');
});

then('I can download the resource', () => {
    cy.get('pb-link a').eq(0).should('have.attr', 'href', '../API/pageDownload?id=1');
    cy.get('pb-link a').eq(0).should('have.attr', 'target', '_blank');
});

then("The warning message is displayed with the token {string}", (pageToken) => {
    cy.get('.modal').contains(pageToken).should('be.visible');
});

then("The {string} button for the resource {string} is not disabled and has no tooltip", (iconName, resourceNumber) => {
    cy.get('.action-button-container .glyphicon-' + iconName).parent().eq(resourceNumber - 1).should('not.be.disabled');
    cy.get('.action-button-container .glyphicon-' + iconName).eq(resourceNumber - 1).should('not.have.attr', 'title');
});

then("The {string} button for the resource {string} is disabled and has a tooltip", (iconName, resourceNumber) => {
    cy.get('.action-button-container .glyphicon-' + iconName).parent().eq(resourceNumber - 1).should('be.disabled');
    cy.get('.action-button-container .glyphicon-' + iconName).eq(resourceNumber - 1).should('have.attr', 'title');
});

then("It uploads a resource", () => {
    cy.get('.modal-body input[type="file"]').selectFile('test/mockServer/resource.zip', {force: true});
    cy.get('.modal-body input[type="text"]').should('have.value', 'Uploading...');
    cy.get('.modal-body .file-upload input[type="text"]').should('have.value', 'resource.zip');
});

then("The resource is installed", () => {
    cy. contains(".modal-body p", "Resource successfully installed")
})