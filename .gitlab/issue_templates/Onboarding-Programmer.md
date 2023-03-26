# Welcome to Mythic Table

We want to thank you for choosing to join the programming team. Without people like you, Mythic Table wouldn't be. So, We greatly appreciate your willingness to join us in our adventure. With that said, we do have some basics to cover to get you ready for battle, but will try and make it as painless as possible and maybe even a little fun.

**Please go through the items below and check them off as they are completed:**

---

## **1. Slack**

We use Slack for almost all of our communication and to be a productive team member, we need you to join us on Slack. If you don't already have Slack, I suggest downloading the [desktop version](https://slack.com/downloads/windows) and/or you can find the mobile version for your phone.

**Then join the #dev channel!**

Feel free to post a bit about yourself and say "hello, world!". We are now a team and would love to get to know you.

_Make sure you set your notification times. You need to set health work hours for yourself and shouldn't be interupprted during off hours._

<br/>

> 1. [ ] **INSTALLED SLACK AND JOINED "#dev" CHANNEL**

---

## **2. Process**

Just like any dev team, Mythic Table has crafted necessary processes to keep organization and ease of use for everyone. This way as team members come and go, anyone can jump in and know what is going on. Please take some time to read over our process:

- [Mythic Table Process](https://gitlab.com/mythicteam/mythictable/-/wikis/)

<br/>

> 2. [ ] **READ OVER MYTHIC TABLE PROCESS**

---

## **3. Git**

We use [Git](https://git-scm.com/) for version control of our software and site. And as Git is prevalent in the industry, it is useful to know, if you don't already.

We have some rather specific rules around how we use it at Mythic Table, such as how to name branches, commits, etc. Please review our Git rules

- [How to Branch and Merge on Mythic Table](https://gitlab.com/mythicteam/mythictable/-/wikis/how-to/branching)

<br/>

> 3. [ ] **INSTALLED GIT**
> 4. [ ] **READ HOW TO BRANCH AND MERGE FOR MYTHIC TABLE**

---

## **4. Your First Commit**

**Woot Woot!** You made it through all the _boring_ stuff... well minus looking at our awesome website and now lets do our first commit!
We work really hard to make sure that Local Development is as easy as possible, but with new versions of dependencies constantly released. You may face some unexpecte hurdles. In that situation, feel free to reach out to your teammates on the #dev channel and ask for help.

Now, lets do something **FUN!!!** like adding our new teammate's name to the contributors... yes, that's you. If you are a seasoned pro using Git, this will be easy, but I broke it down into easy steps for those new to Git.

#### Step 1:

Create a folder to clone the Mythic Table repo into. This folder should be somewhere easy to navigate to using your terminal, such as your desktop or documents folder.

#### Step 2:

Open your OS's terminal program such as Window's command prompt or PowerShell. You can also do this in your IDE such as VSCode.

#### Step 3:

Navigate to the folder you created

**_example_**

`cd Desktop/Mythic Table`

#### Step 4:

Clone the Mythic Table Repo.

`git clone https://gitlab.com/mythicteam/mythictable.git`

#### Step 5:

Create a new branch using the Mythic Table naming convention.

`git checkout -b issue/##-(your name)-onboarding`

#### Step 6:

Find and edit CONTRIBUTORS.md - Add your name ;)

#### Step 7:

Check status to make sure CONTRIBUTORS.md shows changes. It should be in red.

`git status`

**_example output:_**

```
On branch improvement/##-(YOUR NAME)-onboard
Changes not staged for commit:
 (use "git add <file>..." to update what will be committed)
 (use "git restore <file>..." to discard changes in working directory)
       modified:   CONTRIBUTORS.md

`no changes added to commit (use "git add" and/or "git commit -a")
```

Now, stage your changes

`git add CONTRIBUTORS.md`

Which should change you output, if you run 'git status' to show CONTRIBUTORS.md in green

#### Step 8:

Commit your changes using the Mythic Table commit naming convention

`git commit -m "Issue #??: Adding myself to CONTRIBUTORS.md"`

#### Step 9:

Push your changes to the Mythic Table repo to be reviewed and merged

`git push -u origin issue/##-your-name-onboarding`

<br/>

> 5. [ ] **EDITED CONTRIBUTORS AND PUSHED FIRST COMMIT**

---

## **5. Your First Merge Request**

Now that we have successfully pushed our first commit, we must create a merge request. Notifying the team that we have made changes that we would like to be merged with the code base. This process is simple and again I broke it down for those who are new to the process.

![alt text](https://i.imgur.com/xL3P4D5.png)

<!-- create link to merge_requests -->

#### Step 1:

Visit the [Mythic Table GitLab](https://gitlab.com/mythicteam/mythictable/-/merge_requests) page

#### Step 2:

Create a new merge request. If you're lucky there will be a quick create option for your new branch when you arrive. This will be across the top of the page and usually in a green bar. Else click the blue button that says 'New merge request'

#### Step 3:

Select a template for your Merge Request and fill in the appropiate sections of the template. Once filled in, click the 'Create merge request'

#### Step 4:

Ask someone to review your merge request by posting to the #dev channel with the link to your merge request.

#### Step 5:

Squash, Merge and Delete your branch. You're done!

<br/>

> 6. [ ] **CREATED FIRST MERGE REQUEST AND SUCCESSFULLY MERGED**

---

## **6. Local Dev**

Now, that we have completed our first merge, lets get you ready to start crushing it with some real code. To do that you'll need to set up your local machine with the needed dependencies.

> **Warning:** Since the instructions are apt to change without notice to reflect new processes and systems, steps for this can be found in the code till we have time to update this process. If you run into errors, please notify the team so we can adjust this document to reflect the new changes.

- [Local Application](https://gitlab.com/mythicteam/mythictable/-/blob/main/README.md)

#### Step 1:

Install [ASP.NET Core Hosting Bundle](https://download.visualstudio.microsoft.com/download/pr/8c089b35-4e8d-4eda-b1e9-1267d2240818/4f60c233e5c968a236e853576548f6ae/dotnet-hosting-3.1.23-win.exe)

This is needed to run the backend of the application as you are testing your code.

#### Step 2:

Install NVM (Node Version Manager). Which will allow you to install and use different versions of Node.js. This is extremely helpful as it is likely new version will be released of Node and can cause errors.

###### Linux/Mac Users

- [NVM for Linux/Mac Users](https://github.com/nvm-sh/nvm)

###### Windows Users

- [NVM for Windows Users](https://github.com/coreybutler/nvm-windows/releases)

**_Note:_** For Windows users, I had to run my PowerShell in Admin mode when using the NVM for Windows users. From there, I could install different versions of Node and switch the version. If you have questions, message me, Blaine, on Slack

#### Step 3:

Open a terminal (or Powershell in Admin mode for Windows users). From there we will install Node 12.18.2 (until we update our dependencies)

`nvm install 12.18.2`

You should see it in the list of available Node versions if you run:

`nvm list`

**_example output_**

```
PS C:\Users\hazel\OneDrive\Desktop\Mythic Table\mythictable\html> nvm list

  * 17.9.0 (Currently using 64-bit executable)
    12.18.2
```

As you can see, I have two versions available. I have the newest and the one we installed.

Switch to using the older version, but running:

`nvm use 12.18.2`

If you run the 'nvm list', you should see 12.18.2 is now the one being currently used.

#### Step 4:

Next, we install the dev-certs by navigating in to the mythictable/server/src/MythicTable folder. Navigate to the Mythic Table folder where you cloned the Mythic Table repo in to.

**_example_**

`cd Desktop/Mythic Table/mythictable/server/src/MythicTable`

#### Step 5:

Run the following commands:

`dotnet dev-certs https`
`dotnet dev-certs https --trust`

#### Step 6:

Start the backend server, by running:

`dotnet run`

#### Step 7:

For this part, we need to use PowerShell in admin mode (if using Windows) or Linux/Mac shell if using either of those. We will be using the NVM to install the front end dependencies using the older version of Node.

In the new terminal, navigate to mythictable/html

**_example_**

`cd Desktop/Mythic Table/mythictable/html`

Make sure our nvm current version in use is 12.18.2 by running

`nvm use 12.18.2`

then install the dependencies by running npm install

`npm install`

#### Step 8:

Launch the front end

`npm start`

<br/>

> 7. [ ] **SUCCESSFULLY LAUNCHED BACK END**
> 8. [ ] **SUCCESSFULLY LAUNCHED FRONT END**

---

## **7. Victory**

You have successfully completed your initial onboarding. Next step is to schedule a paired programming session with one of the senior devs, who can further your training. Post to the #dev channel and someone will reach out to you.

> 9. [ ] **SCHEDULED PAIR PROGRAMMING SESSION**
