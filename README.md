<p>
	<h1 align="center">
	miniCal Extension Boilerplate</h1>
</p>

## Table of Contents
* [Introduction](#introduction)
* [Installation](#installation)
* [Features](#features)
* [Tutorial](#tutorial)
* [Dependencies](#dependencies)
* [Versioning](#versioning)
* [License](#license)

### Introduction
It is a sample boilerplate extension it contains the basic structure of a typical extension. It will show you the list of bookings. The fundamental purpose of this extension is to guide you on how to build your extension.
 

### Installation
* Fork the repository https://github.com/minical/minical-extension-boilerplate or clone it locally. 
* Upload the extension folder into the /public/application/extensions directory.
* Activate the extension through the "Extensions" screen in miniCal.
* Click on the setting icon or view icon. It will lead you to the Booking List page.

<img src="https://snipboard.io/zWSbQi.jpg" alt=""> 

### Features
* Show the list of bookings.

### Tutorial
**Extension Directory Structure**<br/>
This is the directory structure that miniCal follows for an extension, under the extensions folder create a minical-extension-boilerplate folder. 
```
 |->minical-extension-boilerplate
			 |->assets
                              |->js
                              |->css
			 |->config
                              |->autoload.php
                              |->config.php
                              |->menu.php
                              |->route.php
			 |->controllers
                         |->helpers
                         |->hooks
                              |->actions.php
                              |->filters.php
                         |->language
                         |->libraries
			 |->models
			 |->views
			
```
**Controllers**<br/>
We’ll start by creating a controller inside minical-extension-boilerplate->controllers. In this example, there is a variable $module_name its module name or folder name in this case it's minical-extension-boilerplate. _Construct(), initialize all the dependencies such as models, libraries, helpers. now moving forward in any controller's method load the JS or CSS file related to that particular section. Here is the detail about how you can add custom data into the database [Managing Customdata].

**Assets**<br/>
This folder has two subfolders CSS and js, As clear by its name all the js files (.js extension) or third-party files will reside here. And all CSS files custom or third-party will reside here.

**Config**<br/>
This folder has four files each file has its different work.
1. **autoload.php:** This file load all the asset dependency in the controller. Make a config array and add all files to it, config array has a "file" key that has JS file location as value and a "location" key that has an array of locations("controller_name/method_name") as value(where this JS file going to load).
2. **config.php:** This file has the config array containing the extension details such as name, description, or any information about it. 'is_default_active' key has 1 or 0.
3. **menu.php:** This file has menu-related details such as the extension's menu label, position on the menu bar, and route link. In this array, the 'location' key has a value such as PRIMARY, SECONDARY, and THIRD. 'label' key has menu label, 'link' key has URL link.
4. **route.php:** This has an array of extension routes, the route will be defined as the same ci route.

**language**<br/>
Language folder contains subfolders of languages, each language subfolder will contain an index.php file, this file will have an array of words.
```
language
      |->english
             |->index.php
      |->korean
             |->index.php
      |->portuguese 
             |->index.php

```
$lang array key will have the like [extension_folder_name][keyword] and for value translation of the keyword. 

**Models**<br/>
This folder contains model files, all the database-related queries will go on these files.

**View**<br/>
A view is simply a web page, or a page fragment, like a header, footer, sidebar, etc. Views can flexibly be embedded within other views (within other views, etc., etc.) if you need this type of hierarchy.
Views are never called directly, they must be loaded by a controller. 


**Library**<br/>
The library is a class with functions or methods that allows creating an instance of that class.
For your extensions you can add a library under the libraries folder, the naming convention should be like GreetingEmail.php.

**Helper**<br/>
Each helper file is simply a collection of functions in a particular category. For example, we have a booking_list_helper.php file. 
<br/>For loading helper file go to the autoload.php under config folder of your extension add helper file in the array, use $extension_helper variable.
you can add multiple helper files into this array, they will be loaded automatically by my_controller. 


**Hooks**<br/>
Under the hooks folder, we have 2 files actions.php and filters.php<br/>
**1. Actions:-** 
Action is one of the two types of hooks. They provide a way for running a function at a specific point in the execution of miniCal Core. Callback functions for an Action do not return anything to the calling Action hook. You can create a hook in the application/hooks folder,
here we have created an actions.php file.
<br>You can find the list of actions here [miniCal Action list](https://github.com/minical/minical/wiki/The-list-of-the-miniCal-actions) 
```
<?php
//file name actions.php
// This is a core action that will be executed when a new reservation is created in miniCal
add_action('add.booking.created', 'your_callback_function_1', 10, 1);
function your_callback_function_1($data) {
    // code here
}


// This is a custom action and can be executed from this extension controllers.
add_action('my-custom-action', 'your_custom_callback_function', 10, 1);
function your_custom_callback_function($data) {
    // code here
}
```
**2. Filters:-**
They provide a way for functions to modify data during the execution of the miniCal Core. They are the counterpart to action.
You can create a hook in the application/hooks folder,
here we have created a filers.php file.

```
<?php
// This is a custom action and can be executed from this extension controllers.
add_filter('my-custom-filter', 'your_callback_function_2', 10, 1);
function your_callback_function_2($data) {
    
    // start writing code here
    // return $data;
}
```

### Dependencies

### Versioning

The version is broken down into 4 points e.g 1.2.3.4 We use MAJOR.MINOR.FEATURE.PATCH to describe the version numbers.

A MAJOR is very rare, it would only be considered if the source was effectively re-written or a clean break was desired for other reasons. This increment would likely break most 3rd party modules.

A MINOR is when there are significant changes that affect core structures. This increment would likely break some 3rd party modules.

A FEATURE version is when new extensions or features are added (such as a payment gateway, shipping module, etc). Updating a feature version is at low risk of breaking 3rd party modules.

A PATCH version is when a fix is added, it should be considered safe to update patch versions e.g 1.2.3.4 to 1.2.3.5

### License

[The Open Software License 3.0 (OSL-3.0)]()
