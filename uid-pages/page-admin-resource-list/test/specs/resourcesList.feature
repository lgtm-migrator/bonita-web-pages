Feature: The resources list in desktop resolution

  Scenario: The resources list displays the correct attributes
    Given The filter response "default filter with headers" is defined
    When I visit the resources list page
    Then The resources have the correct information

  Scenario: The resources list filtered by content type works correctly
    Given The filter response "default filter with headers" is defined
    And The filter response "content type" is defined
    When I visit the resources list page
    Then A list of "5" resources is displayed
    When I put "Pages" in "content type" filter field
    Then The api call is made for "Pages"
    When I put "All resources" in "content type" filter field
    Then A list of "5" resources is displayed
    When I put "Layouts" in "content type" filter field
    Then No resources are available

  Scenario: The resources list sort by works correctly
    Given The filter response "default filter with headers" is defined
    And The filter response "sort by" is defined
    When I visit the resources list page
    Then A list of "5" resources is displayed
    When I put "Updated (Newest first)" in "sort by" filter field
    Then The api call is made for "Updated (Newest first)"
    When I put "Updated (Oldest first)" in "sort by" filter field
    Then The api call is made for "Updated (Oldest first)"
    When I put "Resource name (Asc)" in "sort by" filter field
    Then The api call is made for "Resource name (Asc)"
    When I put "Resource name (Desc)" in "sort by" filter field
    Then The api call is made for "Resource name (Desc)"

  Scenario: Search by resource name works correctly
    Given The filter response "default filter with headers" is defined
    And The filter response "search by name" is defined
    When I visit the resources list page
    Then A list of "5" resources is displayed
    When I put "ApplicationHomeBonita" in "search" filter field
    Then The api call is made for "ApplicationHomeBonita"
    When I erase the search filter
    Then A list of "5" resources is displayed
    When I put "Search term with no match" in "search" filter field
    Then No resources are available

  Scenario: Hide provided resources works correctly
    Given The filter response "default filter with headers" is defined
    And The filter response "hide provided resources" is defined
    When I visit the resources list page
    Then A list of "5" resources is displayed
    When I filter hide provided resources
    Then The api call is made for "hide provided resources"

  Scenario: Should export a resource
    Given The filter response "default filter with headers" is defined
    When I visit the index page
    Then I can download the resource
