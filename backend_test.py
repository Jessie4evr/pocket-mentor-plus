#!/usr/bin/env python3
"""
Pocket Mentor+ Chrome Extension Testing Suite
Tests the extension files, structure, and functionality
"""

import json
import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any

class PocketMentorExtensionTester:
    def __init__(self, extension_path: str = "/app"):
        self.extension_path = Path(extension_path)
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        self.warnings = []
        
    def log_test(self, test_name: str, passed: bool, message: str, is_warning: bool = False):
        """Log test results"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {test_name}: {message}")
        else:
            if is_warning:
                self.warnings.append(f"{test_name}: {message}")
                print(f"⚠️ {test_name}: {message}")
            else:
                self.errors.append(f"{test_name}: {message}")
                print(f"❌ {test_name}: {message}")
    
    def test_manifest_json(self) -> bool:
        """Test manifest.json validity and structure"""
        print("\n🔍 Testing manifest.json...")
        
        manifest_path = self.extension_path / "manifest.json"
        if not manifest_path.exists():
            self.log_test("Manifest Existence", False, "manifest.json not found")
            return False
        
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
        except json.JSONDecodeError as e:
            self.log_test("Manifest JSON", False, f"Invalid JSON: {e}")
            return False
        
        # Check required fields
        required_fields = {
            'manifest_version': 3,
            'name': 'string',
            'version': 'string',
            'description': 'string'
        }
        
        for field, expected in required_fields.items():
            if field not in manifest:
                self.log_test(f"Manifest Field: {field}", False, f"Missing required field")
                continue
            
            if field == 'manifest_version' and manifest[field] != expected:
                self.log_test(f"Manifest Field: {field}", False, f"Expected {expected}, got {manifest[field]}")
                continue
            elif expected == 'string' and not isinstance(manifest[field], str):
                self.log_test(f"Manifest Field: {field}", False, f"Expected string, got {type(manifest[field])}")
                continue
            
            self.log_test(f"Manifest Field: {field}", True, f"Valid {expected}")
        
        # Check permissions
        required_permissions = ['contextMenus', 'activeTab', 'scripting', 'storage', 'notifications']
        if 'permissions' in manifest:
            missing_perms = [p for p in required_permissions if p not in manifest['permissions']]
            if missing_perms:
                self.log_test("Manifest Permissions", False, f"Missing permissions: {missing_perms}")
            else:
                self.log_test("Manifest Permissions", True, "All required permissions present")
        else:
            self.log_test("Manifest Permissions", False, "No permissions field found")
        
        # Check service worker
        if 'background' in manifest and 'service_worker' in manifest['background']:
            sw_file = manifest['background']['service_worker']
            if (self.extension_path / sw_file).exists():
                self.log_test("Service Worker", True, f"Service worker file exists: {sw_file}")
            else:
                self.log_test("Service Worker", False, f"Service worker file not found: {sw_file}")
        else:
            self.log_test("Service Worker", False, "Service worker not configured")
        
        # Check icons
        if 'icons' in manifest:
            for size, icon_path in manifest['icons'].items():
                if (self.extension_path / icon_path).exists():
                    self.log_test(f"Icon {size}", True, f"Icon file exists: {icon_path}")
                else:
                    self.log_test(f"Icon {size}", False, f"Icon file not found: {icon_path}")
        
        return True
    
    def test_file_structure(self) -> bool:
        """Test required files exist"""
        print("\n🔍 Testing file structure...")
        
        required_files = [
            "manifest.json",
            "background.js", 
            "popup.html",
            "popup.js",
            "notebook.html", 
            "notebook.js",
            "content.js",
            "api.js",
            "styles.css"
        ]
        
        for file in required_files:
            file_path = self.extension_path / file
            if file_path.exists():
                self.log_test(f"File: {file}", True, "File exists")
            else:
                self.log_test(f"File: {file}", False, "File not found")
        
        # Check icon files
        icon_files = ["icon16.png", "icon48.png", "icon128.png"]
        for icon in icon_files:
            icon_path = self.extension_path / icon
            if icon_path.exists():
                self.log_test(f"Icon: {icon}", True, "Icon file exists")
            else:
                self.log_test(f"Icon: {icon}", False, "Icon file not found")
        
        return True
    
    def test_html_files(self) -> bool:
        """Test HTML files for basic structure"""
        print("\n🔍 Testing HTML files...")
        
        html_files = ["popup.html", "notebook.html"]
        
        for html_file in html_files:
            file_path = self.extension_path / html_file
            if not file_path.exists():
                self.log_test(f"HTML: {html_file}", False, "File not found")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check basic HTML structure
                if not content.strip().startswith('<!DOCTYPE html>'):
                    self.log_test(f"HTML: {html_file} DOCTYPE", False, "Missing DOCTYPE declaration")
                else:
                    self.log_test(f"HTML: {html_file} DOCTYPE", True, "Valid DOCTYPE")
                
                required_tags = ['<html', '<head>', '<body>', '</html>']
                for tag in required_tags:
                    if tag not in content:
                        self.log_test(f"HTML: {html_file} {tag}", False, f"Missing {tag} tag")
                    else:
                        self.log_test(f"HTML: {html_file} {tag}", True, f"Has {tag} tag")
                
                # Check for CSS inclusion
                if 'styles.css' in content:
                    self.log_test(f"HTML: {html_file} CSS", True, "Includes styles.css")
                else:
                    self.log_test(f"HTML: {html_file} CSS", False, "Missing styles.css inclusion")
                
                # Check for corresponding JS file
                js_file = html_file.replace('.html', '.js')
                if js_file in content:
                    self.log_test(f"HTML: {html_file} JS", True, f"Includes {js_file}")
                else:
                    self.log_test(f"HTML: {html_file} JS", False, f"Missing {js_file} inclusion")
                
            except Exception as e:
                self.log_test(f"HTML: {html_file}", False, f"Error reading file: {e}")
        
        return True
    
    def test_javascript_files(self) -> bool:
        """Test JavaScript files for basic syntax and structure"""
        print("\n🔍 Testing JavaScript files...")
        
        js_files = ["api.js", "background.js", "popup.js", "notebook.js", "content.js"]
        
        for js_file in js_files:
            file_path = self.extension_path / js_file
            if not file_path.exists():
                self.log_test(f"JS: {js_file}", False, "File not found")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for basic syntax issues
                if content.strip():
                    self.log_test(f"JS: {js_file} Content", True, "File has content")
                else:
                    self.log_test(f"JS: {js_file} Content", False, "File is empty")
                    continue
                
                # Check for Chrome API usage (where expected)
                if js_file in ["background.js", "popup.js", "content.js"]:
                    if "chrome." in content:
                        self.log_test(f"JS: {js_file} Chrome API", True, "Uses Chrome APIs")
                    else:
                        self.log_test(f"JS: {js_file} Chrome API", False, "No Chrome API usage detected", True)
                
                # Check for ES6 modules (where expected)
                if js_file in ["api.js", "background.js"]:
                    if "export" in content or "module.exports" in content:
                        self.log_test(f"JS: {js_file} Exports", True, "Has exports")
                    else:
                        self.log_test(f"JS: {js_file} Exports", False, "No exports found", True)
                
                # Check for error handling
                if "try" in content and "catch" in content:
                    self.log_test(f"JS: {js_file} Error Handling", True, "Has error handling")
                else:
                    self.log_test(f"JS: {js_file} Error Handling", False, "No error handling detected", True)
                
                # Check for console logging
                if "console.log" in content or "console.error" in content:
                    self.log_test(f"JS: {js_file} Logging", True, "Has logging")
                else:
                    self.log_test(f"JS: {js_file} Logging", False, "No logging detected", True)
                
            except Exception as e:
                self.log_test(f"JS: {js_file}", False, f"Error reading file: {e}")
        
        return True
    
    def test_css_file(self) -> bool:
        """Test CSS file structure"""
        print("\n🔍 Testing CSS file...")
        
        css_path = self.extension_path / "styles.css"
        if not css_path.exists():
            self.log_test("CSS File", False, "styles.css not found")
            return False
        
        try:
            with open(css_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if content.strip():
                self.log_test("CSS Content", True, "CSS file has content")
            else:
                self.log_test("CSS Content", False, "CSS file is empty")
                return False
            
            # Check for CSS variables
            if ":root" in content:
                self.log_test("CSS Variables", True, "Uses CSS variables")
            else:
                self.log_test("CSS Variables", False, "No CSS variables found", True)
            
            # Check for theme support
            if "light-theme" in content and "dark-theme" in content:
                self.log_test("CSS Themes", True, "Has theme support")
            else:
                self.log_test("CSS Themes", False, "No theme support detected")
            
            # Check for responsive design
            if "@media" in content:
                self.log_test("CSS Responsive", True, "Has responsive design")
            else:
                self.log_test("CSS Responsive", False, "No responsive design detected", True)
            
        except Exception as e:
            self.log_test("CSS File", False, f"Error reading CSS file: {e}")
        
        return True
    
    def test_api_structure(self) -> bool:
        """Test API wrapper structure"""
        print("\n🔍 Testing API structure...")
        
        api_path = self.extension_path / "api.js"
        if not api_path.exists():
            self.log_test("API File", False, "api.js not found")
            return False
        
        try:
            with open(api_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for main API class
            if "class PocketMentorAPI" in content:
                self.log_test("API Class", True, "PocketMentorAPI class found")
            else:
                self.log_test("API Class", False, "PocketMentorAPI class not found")
            
            # Check for AI API methods
            expected_methods = [
                "summarizeText",
                "translateText", 
                "proofreadText",
                "rewriteText",
                "explainText",
                "generateQuiz",
                "generateStudyNotes"
            ]
            
            for method in expected_methods:
                if method in content:
                    self.log_test(f"API Method: {method}", True, "Method found")
                else:
                    self.log_test(f"API Method: {method}", False, "Method not found")
            
            # Check for Chrome AI API usage
            if "window.ai" in content or "chrome.aiOriginTrial" in content:
                self.log_test("API Chrome AI", True, "Uses Chrome AI APIs")
            else:
                self.log_test("API Chrome AI", False, "No Chrome AI API usage")
            
        except Exception as e:
            self.log_test("API Structure", False, f"Error reading API file: {e}")
        
        return True
    
    def test_background_script(self) -> bool:
        """Test background script structure"""
        print("\n🔍 Testing background script...")
        
        bg_path = self.extension_path / "background.js"
        if not bg_path.exists():
            self.log_test("Background Script", False, "background.js not found")
            return False
        
        try:
            with open(bg_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for event listeners
            expected_listeners = [
                "chrome.runtime.onInstalled",
                "chrome.contextMenus.onClicked", 
                "chrome.runtime.onMessage"
            ]
            
            for listener in expected_listeners:
                if listener in content:
                    self.log_test(f"Background: {listener}", True, "Event listener found")
                else:
                    self.log_test(f"Background: {listener}", False, "Event listener not found")
            
            # Check for context menu creation
            if "createContextMenus" in content or "chrome.contextMenus.create" in content:
                self.log_test("Background: Context Menus", True, "Context menu creation found")
            else:
                self.log_test("Background: Context Menus", False, "No context menu creation")
            
            # Check for storage usage
            if "chrome.storage" in content:
                self.log_test("Background: Storage", True, "Uses Chrome storage")
            else:
                self.log_test("Background: Storage", False, "No storage usage")
            
        except Exception as e:
            self.log_test("Background Script", False, f"Error reading background script: {e}")
        
        return True
    
    def test_content_script(self) -> bool:
        """Test content script structure"""
        print("\n🔍 Testing content script...")
        
        content_path = self.extension_path / "content.js"
        if not content_path.exists():
            self.log_test("Content Script", False, "content.js not found")
            return False
        
        try:
            with open(content_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for message listeners
            if "chrome.runtime.onMessage" in content:
                self.log_test("Content: Message Listener", True, "Has message listener")
            else:
                self.log_test("Content: Message Listener", False, "No message listener")
            
            # Check for selection handling
            if "getSelection" in content or "window.getSelection" in content:
                self.log_test("Content: Selection", True, "Handles text selection")
            else:
                self.log_test("Content: Selection", False, "No selection handling")
            
            # Check for keyboard shortcuts
            if "addEventListener('keydown'" in content:
                self.log_test("Content: Keyboard", True, "Has keyboard event handling")
            else:
                self.log_test("Content: Keyboard", False, "No keyboard handling")
            
            # Check for tooltip/UI injection
            if "createElement" in content:
                self.log_test("Content: UI Injection", True, "Can inject UI elements")
            else:
                self.log_test("Content: UI Injection", False, "No UI injection")
            
        except Exception as e:
            self.log_test("Content Script", False, f"Error reading content script: {e}")
        
        return True
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return results"""
        print("🚀 Starting Pocket Mentor+ Extension Tests...\n")
        
        # Run all test methods
        self.test_manifest_json()
        self.test_file_structure()
        self.test_html_files()
        self.test_javascript_files()
        self.test_css_file()
        self.test_api_structure()
        self.test_background_script()
        self.test_content_script()
        
        # Print summary
        self.print_summary()
        
        return {
            'total_tests': self.tests_run,
            'passed': self.tests_passed,
            'failed': self.tests_run - self.tests_passed,
            'success_rate': (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            'errors': self.errors,
            'warnings': self.warnings
        }
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Test Summary:")
        print(f"Total Tests: {self.tests_run}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}")
        print(f"⚠️ Warnings: {len(self.warnings)}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.errors:
            print(f"\n❌ Critical Issues ({len(self.errors)}):")
            for error in self.errors:
                print(f"  • {error}")
        
        if self.warnings:
            print(f"\n⚠️ Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  • {warning}")
        
        print(f"\n🎯 Next Steps:")
        if not self.errors:
            print("✅ Extension structure is valid!")
            print("📝 Load the extension in Chrome for functional testing:")
            print("   1. Go to chrome://extensions/")
            print("   2. Enable Developer mode")
            print("   3. Click 'Load unpacked' and select /app folder")
            print("   4. Enable Chrome AI flags:")
            print("      - chrome://flags/#optimization-guide-on-device-model")
            print("      - chrome://flags/#prompt-api-for-gemini-nano")
            print("   5. Restart Chrome and test functionality")
        else:
            print("🔧 Fix critical issues before loading the extension")
            print("📖 Check Chrome Extension documentation for guidance")

def main():
    """Main test runner"""
    tester = PocketMentorExtensionTester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()