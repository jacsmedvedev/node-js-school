Feature: As a API user, I want to manage users

  Scenario: Create new user
    When I add new user with unique email
    Then I should receive a details for him