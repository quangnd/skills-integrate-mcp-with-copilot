document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
          <form class="register-form">
            <input type="email" class="register-email" required placeholder="your-email@mergington.edu" />
            <button type="submit">Register Student</button>
          </form>
        `;

        // Register form event
        const registerForm = activityCard.querySelector(".register-form");
        registerForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const emailInput = registerForm.querySelector(".register-email");
          const email = emailInput.value.trim();
          if (!email) return;
          try {
            const response = await fetch(`/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`, {
              method: "POST"
            });
            const result = await response.json();
            const messageDiv = document.getElementById("message");
            if (response.ok) {
              messageDiv.textContent = `Registered ${email} for ${name}!`;
              messageDiv.classList.remove("hidden");
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || "Registration failed.";
              messageDiv.classList.remove("hidden");
            }
          } catch (err) {
            const messageDiv = document.getElementById("message");
            messageDiv.textContent = "Error registering student.";
            messageDiv.classList.remove("hidden");
          }
        });

        activitiesList.appendChild(activityCard);

    // ...existing code...
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // ...removed global signup form handler...

  // Initialize app
  fetchActivities();
});
