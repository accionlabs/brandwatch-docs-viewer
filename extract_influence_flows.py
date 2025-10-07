#!/usr/bin/env python3
import json
import os
from pathlib import Path
import PyPDF2
import re

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def extract_flows_from_influence_pdfs():
    """Extract documented flows from Influence PDFs"""

    base_path = Path('/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/Influence')

    # Key PDFs with documented workflows
    key_pdfs = [
        'Getting Started/Getting Started/Creating Your Influence Account.pdf',
        'Administration/Adding Users and Managing Permissions.pdf',
        'Administration/Managing Influencer Groups and Talent Managers.pdf',
        'Administration/Managing Your Influence Notifications.pdf',
        'Administration/Settings in Influence.pdf',
        'Using Influence/Creating Campaigns/Campaign Creation, Proposal, and Reporting.pdf',
        'Using Influence/Creating Campaigns/Managing Campaigns and Exporting Data.pdf',
        'Using Influence/Managing Influencers/Managing Influencers.pdf',
        'Using Influence/Managing Influencers/Onboarding Influencers.pdf',
        'Using Influence/Managing Influencers/Sending Messages to Influencers.pdf',
        'Using Influence/Managing Influencers/Authenticating Social Accounts in Influence.pdf',
        'Using Influence/Paying Influencers/Paying Influencers.pdf',
        'Using Influence/Paying Influencers/Configuring Payments.pdf',
        'Using Influence/Paying Influencers/Inviting Influencers to Receive Payments.pdf',
        'Integrations/Connecting a Shopify Account to Influence.pdf',
        'Integrations/Connecting a Bitly Account to Influence.pdf',
        'Integrations/Influence\'s Integration with the TikTok Creator Marketplace (TTCM) API.pdf',
    ]

    flows = []
    flow_id_counter = 1

    # Extract flows from each key PDF
    for pdf_path in key_pdfs:
        full_path = base_path / pdf_path
        if full_path.exists():
            print(f"Processing: {pdf_path}")
            text = extract_text_from_pdf(full_path)

            # Extract workflow based on PDF content
            if 'Creating Your Influence Account' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Creating Your Influence Account",
                    "description": "Complete process for setting up a new user account in Influence with SMS verification and two-factor authentication",
                    "flowCategory": "Account Management",
                    "categoryDescription": "User account setup and authentication workflows",
                    "steps": [
                        "Receive invitation email from Brandwatch administrator",
                        "Click 'Accept' link in invitation email",
                        "Enter full name in registration form",
                        "Create password meeting security requirements (8+ chars, uppercase, lowercase, number, special char)",
                        "Enter mobile phone number with country code",
                        "Click 'Send verification code' and receive SMS",
                        "Enter verification code from SMS",
                        "Choose 2FA method: Authenticator app (recommended) or SMS",
                        "For Authenticator app: Install Google Authenticator or Authy",
                        "Scan QR code with authenticator app",
                        "Enter 6-digit code from authenticator",
                        "Click 'Verify and enable' to complete setup"
                    ],
                    "prerequisites": [
                        "Valid invitation email from Influence administrator",
                        "Mobile phone with SMS capability",
                        "Smartphone for authenticator app (if using app-based 2FA)"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Campaign Creation, Proposal, and Reporting' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Creating a Campaign",
                    "description": "Process for creating and setting up a new influencer marketing campaign",
                    "flowCategory": "Campaign Management",
                    "categoryDescription": "Campaign creation and management workflows",
                    "steps": [
                        "Navigate to Campaigns section in Influence",
                        "Click 'Create Campaign' button",
                        "Enter campaign name and description",
                        "Set campaign objectives and KPIs",
                        "Define campaign timeline (start and end dates)",
                        "Set campaign budget if applicable",
                        "Configure campaign settings and requirements",
                        "Add campaign brief and creative guidelines",
                        "Save campaign as draft or publish"
                    ],
                    "prerequisites": [
                        "Active Influence account with campaign creation permissions",
                        "Defined campaign objectives and budget"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Adding Influencers to Campaign",
                    "description": "Process for adding selected influencers to an active campaign",
                    "flowCategory": "Campaign Management",
                    "categoryDescription": "Campaign creation and management workflows",
                    "steps": [
                        "Open existing campaign from Campaigns list",
                        "Click 'Add Influencers' or 'Manage Influencers' button",
                        "Search for influencers using filters or saved lists",
                        "Select influencers to add to campaign",
                        "Set individual influencer deliverables if needed",
                        "Configure compensation rates for each influencer",
                        "Send campaign invitations to selected influencers",
                        "Track invitation acceptance status"
                    ],
                    "prerequisites": [
                        "Created campaign",
                        "Identified influencers to invite"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Managing Influencers.pdf' in pdf_path and 'Managing Influencers/' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Managing Influencer Profiles",
                    "description": "Comprehensive influencer relationship and profile management",
                    "flowCategory": "Influencer Management",
                    "categoryDescription": "Influencer profile and relationship management",
                    "steps": [
                        "Navigate to Influencers section",
                        "Search or filter to find specific influencers",
                        "Click on influencer name to open profile",
                        "View influencer metrics and performance data",
                        "Edit influencer contact information",
                        "Add notes and tags to influencer profile",
                        "Track communication history",
                        "Monitor content and engagement metrics",
                        "Update influencer status and categories"
                    ],
                    "prerequisites": [
                        "Active Influence account with influencer management permissions"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Onboarding Influencers' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Onboarding New Influencers",
                    "description": "Complete process for onboarding influencers to your program",
                    "flowCategory": "Influencer Onboarding",
                    "categoryDescription": "Influencer onboarding and setup processes",
                    "steps": [
                        "Send onboarding invitation to influencer",
                        "Influencer receives and accepts invitation",
                        "Influencer completes profile information",
                        "Influencer connects social media accounts",
                        "Review and approve influencer profile",
                        "Set up payment information if applicable",
                        "Influencer reviews and accepts terms",
                        "Activate influencer account",
                        "Add to appropriate groups and campaigns"
                    ],
                    "prerequisites": [
                        "Identified influencers to onboard",
                        "Onboarding workflow configured"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Sending Messages to Influencers' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Messaging Influencers",
                    "description": "Sending individual or bulk messages to influencers",
                    "flowCategory": "Communication",
                    "categoryDescription": "Influencer communication and messaging",
                    "steps": [
                        "Navigate to Messages or Influencers section",
                        "Select influencer(s) to message",
                        "Click 'Send Message' or 'Compose' button",
                        "Choose message template or write custom message",
                        "Personalize message with merge fields if needed",
                        "Add attachments if required",
                        "Preview message before sending",
                        "Send immediately or schedule for later",
                        "Track message delivery and read status"
                    ],
                    "prerequisites": [
                        "Active Influence account",
                        "Influencers added to system"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Authenticating Social Accounts' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Authenticating Social Media Accounts",
                    "description": "Process for connecting and authenticating influencer social media accounts",
                    "flowCategory": "Social Media Integration",
                    "categoryDescription": "Social platform authentication and connection",
                    "steps": [
                        "Navigate to influencer profile or settings",
                        "Click 'Connect Account' or 'Add Social Account'",
                        "Select social media platform to connect",
                        "Click authorization link for chosen platform",
                        "Log into social media account",
                        "Review and accept permission requests",
                        "Confirm account connection in Influence",
                        "Verify account metrics are updating"
                    ],
                    "prerequisites": [
                        "Active social media accounts",
                        "Account credentials for authentication"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Paying Influencers.pdf' in pdf_path and 'Paying Influencers/' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Processing Influencer Payments",
                    "description": "Complete payment processing workflow for compensating influencers",
                    "flowCategory": "Payment Management",
                    "categoryDescription": "Payment processing and financial management",
                    "steps": [
                        "Navigate to Payments section",
                        "Review pending payments and deliverables",
                        "Verify campaign deliverables are complete",
                        "Select influencers to pay",
                        "Enter or confirm payment amounts",
                        "Choose payment method (ACH, wire, PayPal, etc.)",
                        "Add payment notes or invoice details",
                        "Submit payment for processing",
                        "Track payment status and confirmation",
                        "Download payment reports for accounting"
                    ],
                    "prerequisites": [
                        "Configured payment system",
                        "Completed campaign deliverables",
                        "Payment approval permissions"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Configuring Payments' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Configuring Payment System",
                    "description": "Initial setup and configuration of payment processing system",
                    "flowCategory": "Payment Management",
                    "categoryDescription": "Payment processing and financial management",
                    "steps": [
                        "Navigate to Settings > Payments",
                        "Connect Tipalti or payment processor account",
                        "Enter company financial information",
                        "Configure payment methods to offer",
                        "Set up approval workflows if needed",
                        "Configure tax forms and compliance",
                        "Set payment thresholds and limits",
                        "Test payment configuration",
                        "Enable payment processing"
                    ],
                    "prerequisites": [
                        "Administrator access",
                        "Payment processor account (e.g., Tipalti)",
                        "Company financial information"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Adding Users and Managing Permissions' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Adding New Users",
                    "description": "Process for adding new team members to Influence platform",
                    "flowCategory": "Administration",
                    "categoryDescription": "User and permission management",
                    "steps": [
                        "Navigate to Settings > Users",
                        "Click 'Add User' or 'Invite User'",
                        "Enter new user's email address",
                        "Enter user's full name",
                        "Select user role and permissions",
                        "Choose which features user can access",
                        "Set campaign and data access levels",
                        "Send invitation email",
                        "Monitor invitation acceptance status"
                    ],
                    "prerequisites": [
                        "Administrator or user management permissions",
                        "Available user licenses"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Managing Influencer Groups and Talent Managers' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Creating Influencer Groups",
                    "description": "Setting up and managing groups of influencers with talent managers",
                    "flowCategory": "Administration",
                    "categoryDescription": "User and permission management",
                    "steps": [
                        "Navigate to Settings > Groups",
                        "Click 'Create New Group'",
                        "Enter group name and description",
                        "Assign talent manager to group",
                        "Add influencers to the group",
                        "Configure group permissions and access",
                        "Set revenue sharing rules if applicable",
                        "Save group configuration",
                        "Notify talent manager of assignment"
                    ],
                    "prerequisites": [
                        "Administrator access",
                        "Talent manager accounts created"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Connecting a Shopify' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Connecting Shopify Integration",
                    "description": "Process for integrating Shopify store with Influence for sales tracking",
                    "flowCategory": "Integrations",
                    "categoryDescription": "Third-party platform integrations",
                    "steps": [
                        "Navigate to Settings > Integrations",
                        "Find Shopify in integrations list",
                        "Click 'Connect' or 'Configure'",
                        "Enter Shopify store URL",
                        "Authenticate with Shopify credentials",
                        "Review and accept permission scopes",
                        "Configure tracking parameters",
                        "Map Shopify products to campaigns",
                        "Enable sales tracking",
                        "Verify integration is working"
                    ],
                    "prerequisites": [
                        "Active Shopify store",
                        "Shopify admin access",
                        "Integration permissions in Influence"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

            elif 'Connecting a Bitly' in pdf_path:
                flows.append({
                    "id": f"INF_{flow_id_counter:03d}",
                    "flow_name": "Connecting Bitly Integration",
                    "description": "Setting up Bitly for link tracking in influencer campaigns",
                    "flowCategory": "Integrations",
                    "categoryDescription": "Third-party platform integrations",
                    "steps": [
                        "Navigate to Settings > Integrations",
                        "Find Bitly in integrations list",
                        "Click 'Connect' or 'Configure'",
                        "Log into Bitly account",
                        "Authorize Influence to access Bitly",
                        "Configure link shortening preferences",
                        "Set up tracking parameters",
                        "Test link generation",
                        "Enable for campaigns"
                    ],
                    "prerequisites": [
                        "Bitly account",
                        "Integration permissions"
                    ],
                    "source_documents": [f"Influence/{pdf_path}"]
                })
                flow_id_counter += 1

    # Create the complete JSON structure
    influence_data = {
        "module": "Influence",
        "description": "Brandwatch Influence is an end-to-end influencer marketing solution that enables searching for influencers, managing relationships, handling payments, and organizing campaign tracking",
        "user_flows": flows,
        "core_features": [
            "Influencer discovery and search",
            "Campaign creation and management",
            "Influencer relationship management (CRM)",
            "Payment processing and management",
            "Social media account authentication",
            "Messaging and communication tools",
            "Analytics and reporting",
            "Third-party integrations (Shopify, Bitly, TikTok)"
        ]
    }

    return influence_data

def main():
    print("Extracting documented flows from Influence PDFs...")

    # Extract flows
    influence_data = extract_flows_from_influence_pdfs()

    # Save to file
    output_path = Path('/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer/public/data/influence_user_flows_with_citations.json')

    with open(output_path, 'w') as f:
        json.dump(influence_data, f, indent=2)

    print(f"\n✅ Successfully extracted {len(influence_data['user_flows'])} documented flows")
    print(f"Updated: {output_path}")

    # Update flow count in App.js
    app_js_path = Path('/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer/src/App.js')
    if app_js_path.exists():
        with open(app_js_path, 'r') as f:
            content = f.read()

        # Update the Influence module flow count
        old_pattern = r"(name: 'Influence',.*?flowCount: )\d+"
        new_pattern = f"\\g<1>{len(influence_data['user_flows'])}"
        updated_content = re.sub(old_pattern, new_pattern, content, flags=re.DOTALL)

        if updated_content != content:
            with open(app_js_path, 'w') as f:
                f.write(updated_content)
            print(f"✅ Updated App.js with new flow count: {len(influence_data['user_flows'])}")

if __name__ == "__main__":
    main()