# quickTest
Test of inconsistent behavior of chrome.runtime.connect() within user scripts injected into documents loaded while extensions are disabled.

# The Issue
When an extension injects user scripts into a document that loaded while the extension was disabled, the injected scripts are unable to use `chrome.runtime.connect()` despite the execution world being configured with messaging enabled.  

I'm unsure whether this is intended behavior, but deleting and reinstalling the extension fixes this even when the tabs / documents haven't changed, and this seems inconsistent with the behavior when an extension is freshly installed.  In that case user scripts injected into documents loaded while the extension was not installed are successfully able to call `chrome.runtime.connect()`.  There also isn't any mention of this specialized behavior in the documentation for chrome.userScripts API, so I'm guessing / hoping this is a bug?

# Demonstration:
1. install the extension
2. enable 'Allow User Scripts' in extension details
3. disable the extension
4. load some new pages / open some new tabs
5. enable the extension and check logs - background will pop up with success / failure messages after a few seconds indicating whether the injected script was able to successfully `chrome.runtime.connect()` or not, logs in tabs will display 'chrome.runtime.connect is not a function' error message where applicable, maybe make note of what tabs / documents failed due to 'chrome.runtime.connect' issue - on my browser, it seems to be anything loaded while the extension was disabled
6. delete the extension
7. reinstall the extension, and recheck logs - note where previous failures are now successes - in my testing, every injected script can now successfully `chrome.runtime.connect()`
