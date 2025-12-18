<template>
  <div class="capital-container">
    <!-- Notification Toast -->
    <div v-if="notification.show" :class="['notification-toast', notification.type]">
      {{ notification.message }}
    </div>

    <!-- First Video Overlay -->
    <div v-if="showFirstVideo" class="video-overlay" @click="skipVideo">
      <video 
        class="capital-video"
        autoplay
        @ended="firstVideoEnded">
        <source src="/Pixel_Art_Dragon_Ride_Video.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <p class="skip-text">Click to skip</p>
    </div>

    <!-- Second Video Overlay -->
    <div v-if="showSecondVideo" class="video-overlay" @click="skipVideo">
      <video 
        class="capital-video"
        autoplay
        @ended="secondVideoEnded">
        <source src="/Create_a_animated_video_of_an.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <p class="skip-text">Click to skip</p>
    </div>

    <!-- Background Audio -->
    <audio ref="bgAudio" loop>
      <source src="/Oldale Town - Pokémon Ruby & Pokémon Sapphire (OST).mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>

    <!-- Main UI -->
    <div class="capital-content" :class="{ 'fade-in': !showFirstVideo && !showSecondVideo }">
      <!-- Back Button -->
      <button class="back-button" @click="goBack">← BACK</button>

      <!-- Audio Mute Toggle -->
      <button class="audio-toggle" @click.stop="toggleMute">{{ isMuted ? '🔇' : '🔊' }}</button>

      <!-- Title -->
      <div class="title-overlay">
        <h1>CAPITAL CITY</h1>
        <p>THE HEART OF THE KINGDOM</p>
      </div>

      <!-- Player Stats Panel -->
      <div class="player-stats">
        <div class="stat-item">
          <span class="stat-label">LVL</span>
          <span class="stat-value">{{ playerLevel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">EXP</span>
          <span class="stat-value">{{ playerExp }}/{{ expToNextLevel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">GOLD</span>
          <span class="stat-value">{{ playerGold }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">HP</span>
          <span class="stat-value">{{ playerHp }}/{{ playerHp }}</span>
        </div>
      </div>

      <!-- Interactive Buttons Overlay -->
      <div class="buttons-overlay">
        <!-- Market Button -->
        <div 
          class="location-button"
          :style="{ top: marketButtonPos.top, left: marketButtonPos.left }"
          @click="openMarket">
          <div class="button-box">MARKET</div>
        </div>

        <!-- Tutorial Button -->
        <div 
          class="location-button"
          :style="{ top: tutorialButtonPos.top, left: tutorialButtonPos.left }"
          @click="openTutorial">
          <div class="button-box">TUTORIAL</div>
        </div>

        <!-- Equipment Button -->
        <div 
          class="location-button"
          :style="{ top: equipmentButtonPos.top, left: equipmentButtonPos.left }"
          @click="openEquipment">
          <div class="button-box">EQUIPMENT</div>
        </div>
      </div>

      <!-- Tutorial Modal -->
      <div v-if="showTutorial" class="modal-overlay" @click="closeTutorial">
        <div class="modal-content" @click.stop>
          <button class="close-modal" @click="closeTutorial">✕</button>
          <h2>⚔️ BYTE ADVENTURES GUIDE ⚔️</h2>
          
          <div class="tutorial-section">
            <h3>🎮 Game Overview</h3>
            <p>Welcome to <strong>Byte Adventures</strong> - an educational RPG where you defeat coding challenges! You'll travel across 8 unique locations, each with their own bosses and difficulty levels. Answer coding questions correctly to earn experience and gold, level up your character, and equip powerful gear!</p>
          </div>

          <div class="tutorial-section">
            <h3>🗺️ Locations & Quests</h3>
            <p>Return to the Map to explore 8 different zones across 4 difficulty tiers:</p>
            <ul>
              <li><strong>🟢 EASY:</strong> Darkwood Forest, Outskirts Village</li>
              <li><strong>🟡 MEDIUM:</strong> Barren Lands, Crystal Bay</li>
              <li><strong>🔴 HARD:</strong> Scorched Sands, Volcanic Dungeon</li>
              <li><strong>⚫ EXTREME:</strong> Shadow Dungeon, Frost Peaks</li>
            </ul>
            <p style="margin-top: 8px;">Each location has multiple bosses with different challenges related to Vue.js, JavaScript, HTML, and CSS concepts! Harder difficulties have stronger bosses with higher rewards!</p>
          </div>

          <div class="tutorial-section">
            <h3>⚔️ Challenge System</h3>
            <p>Start a quest to face a coding challenge! You'll see:</p>
            <ul>
              <li><strong>Problem:</strong> A coding challenge to solve</li>
              <li><strong>Code Editor:</strong> Write your solution with syntax highlighting</li>
              <li><strong>3 Outcomes:</strong> Victory (gain XP & Gold), Defeat (take HP damage), Abandon (no rewards)</li>
            </ul>
            <p style="margin-top: 8px;"><strong>Difficulty scales:</strong> Harder difficulties deal more damage on defeat (Beginner: 10 HP → Extreme: 100 HP)!</p>
          </div>

          <div class="tutorial-section">
            <h3>⭐ Leveling & Experience</h3>
            <p>Victory in quests grants you experience points. Accumulate enough EXP to <strong>level up</strong>:</p>
            <ul>
              <li>Each level requires 100 XP</li>
              <li>Higher levels unlock harder challenges</li>
              <li>Harder bosses = more XP & gold rewards</li>
              <li>Your HP resets to max when you level up!</li>
            </ul>
          </div>

          <div class="tutorial-section">
            <h3>💰 Gold & Equipment Shop</h3>
            <p>Use your gold to buy equipment that boosts your stats:</p>
            <ul>
              <li><strong>⚔️ Weapons:</strong> Increase Max HP</li>
              <li><strong>🛡️ Armor:</strong> Reduce incoming damage taken</li>
              <li><strong>🎩 Headgear:</strong> Boost XP gain from victories</li>
              <li><strong>👢 Footwear:</strong> Additional stat bonuses</li>
            </ul>
            <p style="margin-top: 8px;">You can equip one item per slot to stack bonuses. Browse the shop and manage your inventory from the Market tab!</p>
          </div>

          <div class="tutorial-section">
            <h3>❤️ Health & Combat</h3>
            <p>Your Max HP increases with equipment. On quest defeat, you lose HP based on difficulty. When HP reaches 0, you cannot take more quests until you rest (return to base). Equip armor to reduce damage and defeat high-difficulty bosses safely!</p>
          </div>

          <div class="tutorial-section">
            <h3>💡 Pro Tips</h3>
            <ul>
              <li>Start with Beginner challenges to build HP and gold</li>
              <li>Buy armor early to survive harder bosses</li>
              <li>Explore all locations to find different boss types</li>
              <li>Failed challenges don't reset your HP - only defeats do!</li>
              <li>You can abandon a challenge anytime with no penalty</li>
            </ul>
          </div>

          <button class="tutorial-button" @click="closeTutorial">GOT IT! 🚀</button>
        </div>
      </div>

      <!-- Market Modal -->
      <div v-if="showMarket" class="modal-overlay" @click="closeMarket">
        <div class="market-modal-content" @click.stop>
          <button class="close-modal" @click="closeMarket">✕</button>
          <h2>⚔️ EQUIPMENT MARKET</h2>
          
          <!-- Tab Navigation -->
          <div class="market-tabs">
            <button 
              class="tab-button"
              :class="{ active: marketTab === 'shop' }"
              @click="marketTab = 'shop'">
              🛒 SHOP
            </button>
            <button 
              class="tab-button"
              :class="{ active: marketTab === 'sell' }"
              @click="marketTab = 'sell'">
              💰 SELL
            </button>
            <button 
              class="tab-button"
              :class="{ active: marketTab === 'inventory' }"
              @click="marketTab = 'inventory'">
              📦 INVENTORY
            </button>
          </div>

          <!-- Shop Tab -->
          <div v-if="marketTab === 'shop'" class="tab-content">
            <h3>Available Equipment</h3>
            
            <!-- Search and Filter Bar -->
            <div class="shop-search-filter">
              <input 
                v-model="shopSearchQuery"
                type="text" 
                class="shop-search-bar"
                placeholder="🔍 Search items...">
              
              <select v-model="shopFilterType" class="shop-filter-dropdown">
                <option value="">All Types</option>
                <option value="WEAPON GEAR">Weapon</option>
                <option value="HEAD GEAR">Head</option>
                <option value="BODY GEAR">Armor</option>
                <option value="FOOT GEAR">Foot</option>
              </select>
            </div>

            <!-- Display Mode Toggle -->
            <div class="shop-display-toggle">
              <button 
                :class="{ active: shopDisplayMode === 'all' }"
                @click="shopDisplayMode = 'all'"
                class="toggle-btn">
                📦 BOTH
              </button>
              <button 
                :class="{ active: shopDisplayMode === 'admin' }"
                @click="shopDisplayMode = 'admin'"
                class="toggle-btn">
                ⭐ ADMIN ONLY
              </button>
              <button 
                :class="{ active: shopDisplayMode === 'user' }"
                @click="shopDisplayMode = 'user'"
                class="toggle-btn">
                🛒 USER ONLY
              </button>
            </div>
            
            <!-- ADMIN SHOP SECTION -->
            <div v-if="(shopDisplayMode === 'all' || shopDisplayMode === 'admin') && filteredAdminShopItems.length > 0">
              <h3 style="color: #ffcc00; margin-top: 20px; text-shadow: 2px 2px #000;">⭐ ADMIN SHOP</h3>
              <div class="items-grid-wide">
                <div v-for="item in filteredAdminShopItems" :key="item.id" class="item-card-wide">
                  <div class="item-image-container">
                    <img v-if="item.image" :src="item.image" :alt="item.name" class="item-image">
                    <div v-else class="item-icon-large">{{ item.icon }}</div>
                  </div>
                  <div class="item-info">
                    <h4>{{ item.name }}</h4>
                    <p class="item-description">{{ item.description }}</p>
                    <p class="item-stock">📦 Stock: {{ item.stock }}</p>
                  </div>
                  <div class="item-action">
                    <p class="item-price">💰 {{ item.price }}<br/>GOLD</p>
                    <button 
                      class="buy-button"
                      @click="buyItem(item)"
                      :disabled="playerGold < item.price">
                      BUY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- USER MARKETPLACE SECTION -->
            <div v-if="(shopDisplayMode === 'all' || shopDisplayMode === 'user') && filteredUserShopItems.length > 0">
              <h3 style="color: #4dcfff; margin-top: 20px; text-shadow: 2px 2px #000;">🛒 USER MARKETPLACE</h3>
              <div class="items-grid-wide">
                <div v-for="item in filteredUserShopItems" :key="item.id" class="item-card-wide">
                  <div class="item-image-container">
                    <img v-if="item.image" :src="item.image" :alt="item.name" class="item-image">
                    <div v-else class="item-icon-large">{{ item.icon }}</div>
                  </div>
                  <div class="item-info">
                    <h4>{{ item.name }}</h4>
                    <p class="item-description">{{ item.description }}</p>
                    <p class="item-stock">📦 Stock: {{ item.stock }}</p>
                  </div>
                  <div class="item-action">
                    <p class="item-price">💰 {{ item.price }}<br/>GOLD</p>
                    <!-- Show Cancel Listing button if user is the seller -->
                    <button 
                      v-if="item.userId === currentUserIdFromCredentials"
                      class="cancel-button"
                      @click="cancelListing(item)">
                      CANCEL LISTING
                    </button>
                    <!-- Show Buy button if user is NOT the seller -->
                    <button 
                      v-else
                      class="buy-button"
                      @click="buyItem(item)"
                      :disabled="playerGold < item.price">
                      BUY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="((shopDisplayMode === 'all' && filteredAdminShopItems.length === 0 && filteredUserShopItems.length === 0) || (shopDisplayMode === 'admin' && filteredAdminShopItems.length === 0) || (shopDisplayMode === 'user' && filteredUserShopItems.length === 0))" class="empty-message">
              <p>No items found matching your search</p>
            </div>
          </div>

          <!-- Sell Tab -->
          <div v-if="marketTab === 'sell'" class="tab-content">
            <h3>List Your Equipment for Sale</h3>
            
            <!-- Category Filter Buttons -->
            <div class="sell-category-filter">
              <button 
                class="category-button"
                :class="{ active: sellFilter === 'all' }"
                @click="sellFilter = 'all'">
                📦 ALL
              </button>
              <button 
                class="category-button"
                :class="{ active: sellFilter === 'head' }"
                @click="sellFilter = 'head'">
                🎩 HEAD
              </button>
              <button 
                class="category-button"
                :class="{ active: sellFilter === 'body' }"
                @click="sellFilter = 'body'">
                🛡️ BODY
              </button>
              <button 
                class="category-button"
                :class="{ active: sellFilter === 'foot' }"
                @click="sellFilter = 'foot'">
                👢 FOOT
              </button>
              <button 
                class="category-button"
                :class="{ active: sellFilter === 'weapon' }"
                @click="sellFilter = 'weapon'">
                ⚔️ WEAPON
              </button>
            </div>
            
            <!-- Select Item from Inventory -->
            <div class="sell-section">
              <h4>Step 1: Choose Item from Your Inventory</h4>
              <div v-if="userInventory.length === 0" class="empty-message">
                <p>You have no items to sell. Buy items first!</p>
              </div>
              <div v-else-if="getFilteredSellInventory().length === 0" class="empty-message">
                <p>No items in this category.</p>
              </div>
              <div v-else class="inventory-select-grid">
                <div 
                  v-for="(item, index) in getFilteredSellInventory()" 
                  :key="`inventory-${item.id}`"
                  class="inventory-select-card"
                  :class="{ selected: sellForm.selectedItemIndex === getOriginalInventoryIndex(item) }"
                  @click="() => { console.log('Clicked item id:', item.id, 'selectedIndex will be:', getOriginalInventoryIndex(item)); selectItemToSell(getOriginalInventoryIndex(item)); }">
                  <div class="item-image-container-small">
                    <img v-if="item.image" :src="item.image" :alt="item.name" class="item-image">
                    <div v-else class="item-icon">{{ item.icon }}</div>
                  </div>
                  <h5>{{ item.name }}</h5>
                  <p class="item-type">{{ item.type }}</p>
                </div>
              </div>
            </div>

            <!-- Set Price -->
            <div v-if="sellForm.selectedItemIndex !== null" class="sell-section">
              <h4>Step 2: Set Selling Price</h4>
              <div class="price-form">
                <div class="form-group">
                  <label>Item Name (Auto-filled):</label>
                  <input 
                    :value="sellForm.name" 
                    type="text" 
                    disabled 
                    placeholder="Item will be auto-filled">
                </div>
                <div class="form-group">
                  <label>Selling Price (Gold):</label>
                  <input 
                    v-model.number="sellForm.price" 
                    type="number" 
                    placeholder="Enter selling price">
                </div>
                <button class="sell-button" @click="listItem">LIST ITEM FOR SALE</button>
              </div>
            </div>
          </div>

          <!-- Inventory Tab -->
          <div v-if="marketTab === 'inventory'" class="tab-content">
            <h3>Your Inventory</h3>
            
            <!-- Category Filter Buttons -->
            <div class="inventory-category-filter">
              <button 
                class="category-button"
                :class="{ active: inventoryFilter === 'all' }"
                @click="inventoryFilter = 'all'">
                📦 ALL
              </button>
              <button 
                class="category-button"
                :class="{ active: inventoryFilter === 'head' }"
                @click="inventoryFilter = 'head'">
                🎩 HEAD
              </button>
              <button 
                class="category-button"
                :class="{ active: inventoryFilter === 'body' }"
                @click="inventoryFilter = 'body'">
                🛡️ BODY
              </button>
              <button 
                class="category-button"
                :class="{ active: inventoryFilter === 'foot' }"
                @click="inventoryFilter = 'foot'">
                👢 FOOT
              </button>
              <button 
                class="category-button"
                :class="{ active: inventoryFilter === 'weapon' }"
                @click="inventoryFilter = 'weapon'">
                ⚔️ WEAPON
              </button>
            </div>
            
            <!-- Inventory Items -->
            <div class="inventory-list">
              <div v-if="getFilteredMarketInventory().length === 0" class="empty-message">
                <p v-if="userInventory.length === 0">Your inventory is empty. Buy or list items to get started!</p>
                <p v-else>No items in this category.</p>
              </div>
              <div v-for="item in getFilteredMarketInventory()" :key="item.id" class="inventory-item">
                <div class="item-image-container">
                  <img v-if="item.image" :src="item.image" :alt="item.name" class="item-image">
                  <div v-else class="item-icon">{{ item.icon }}</div>
                </div>
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p class="item-type-small">{{ item.type }}</p>
                  <p v-if="item.description" class="item-description-small">{{ item.description }}</p>
                  <p class="item-stats">+{{ item.bonus }} BONUS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Buffs Modal (unchanged) -->
      <div v-if="showBuffs" class="modal-overlay" @click="closeBuffs">
        <div class="modal-content" @click.stop>
          <button class="close-modal" @click="closeBuffs">✕</button>
          <h2>✨ BUFFS & ENHANCEMENTS</h2>
          
          <div class="items-grid">
            <div v-for="buff in buffItems" :key="buff.id" class="item-card">
              <div class="item-icon">{{ buff.icon }}</div>
              <h4>{{ buff.name }}</h4>
              <p class="item-description">{{ buff.description }}</p>
              <p class="item-stats">+{{ buff.bonus }}% for {{ buff.duration }}s</p>
              <p class="item-price">💰 {{ buff.price }} GOLD</p>
              <button 
                class="buy-button"
                @click="activateBuff(buff)"
                :disabled="playerGold < buff.price">
                ACTIVATE
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment Modal -->
      <div v-if="showEquipment" class="modal-overlay" @click="closeEquipment">
        <div class="modal-content equipment-modal-content" @click.stop>
          <button class="close-modal" @click="closeEquipment">✕</button>
          <h2>⚔️ MANAGE EQUIPMENT</h2>
          
          <!-- Currently Equipped Section -->
          <div class="equipped-section">
            <h3>👕 Currently Equipped</h3>
            <div class="equipped-grid">
              <div class="equipped-item">
                <p class="slot-label">🎩 HEAD:</p>
                <div v-if="equippedDetails.head" class="equipped-item-details">
                  <img v-if="equippedDetails.head.image" :src="equippedDetails.head.image" :alt="equippedDetails.head.name" class="equipped-item-image">
                  <p class="equipped-name">{{ equippedDetails.head.name }}</p>
                  <p class="equipped-stats">+{{ equippedDetails.head.hp }} HP</p>
                  <p class="equipped-description">{{ equippedDetails.head.description }}</p>
                  <button class="unequip-slot-button" @click="unequipSlot('head')">🔓 UNEQUIP</button>
                </div>
                <p v-else class="equipped-name">None</p>
                <button 
                  v-if="!equippedDetails.head"
                  class="equip-slot-button"
                  @click="selectedEquipmentSlot = selectedEquipmentSlot === 'head' ? null : 'head'">
                  ⚙️ EQUIP
                </button>
              </div>
              <div class="equipped-item">
                <p class="slot-label">🛡️ ARMOR:</p>
                <div v-if="equippedDetails.armor" class="equipped-item-details">
                  <img v-if="equippedDetails.armor.image" :src="equippedDetails.armor.image" :alt="equippedDetails.armor.name" class="equipped-item-image">
                  <p class="equipped-name">{{ equippedDetails.armor.name }}</p>
                  <p class="equipped-stats">+{{ equippedDetails.armor.hp }} HP</p>
                  <p class="equipped-description">{{ equippedDetails.armor.description }}</p>
                  <button class="unequip-slot-button" @click="unequipSlot('armor')">🔓 UNEQUIP</button>
                </div>
                <p v-else class="equipped-name">None</p>
                <button 
                  v-if="!equippedDetails.armor"
                  class="equip-slot-button"
                  @click="selectedEquipmentSlot = selectedEquipmentSlot === 'armor' ? null : 'armor'">
                  ⚙️ EQUIP
                </button>
              </div>
              <div class="equipped-item">
                <p class="slot-label">👢 BOOTS:</p>
                <div v-if="equippedDetails.foot" class="equipped-item-details">
                  <img v-if="equippedDetails.foot.image" :src="equippedDetails.foot.image" :alt="equippedDetails.foot.name" class="equipped-item-image">
                  <p class="equipped-name">{{ equippedDetails.foot.name }}</p>
                  <p class="equipped-stats">+{{ equippedDetails.foot.hp }} HP</p>
                  <p class="equipped-description">{{ equippedDetails.foot.description }}</p>
                  <button class="unequip-slot-button" @click="unequipSlot('foot')">🔓 UNEQUIP</button>
                </div>
                <p v-else class="equipped-name">None</p>
                <button 
                  v-if="!equippedDetails.foot"
                  class="equip-slot-button"
                  @click="selectedEquipmentSlot = selectedEquipmentSlot === 'foot' ? null : 'foot'">
                  ⚙️ EQUIP
                </button>
              </div>
              <div class="equipped-item">
                <p class="slot-label">⚔️ WEAPON:</p>
                <div v-if="equippedDetails.weapon" class="equipped-item-details">
                  <img v-if="equippedDetails.weapon.image" :src="equippedDetails.weapon.image" :alt="equippedDetails.weapon.name" class="equipped-item-image">
                  <p class="equipped-name">{{ equippedDetails.weapon.name }}</p>
                  <p class="equipped-stats">+{{ equippedDetails.weapon.hp }} HP</p>
                  <p class="equipped-description">{{ equippedDetails.weapon.description }}</p>
                  <button class="unequip-slot-button" @click="unequipSlot('weapon')">🔓 UNEQUIP</button>
                </div>
                <p v-else class="equipped-name">None</p>
                <button 
                  v-if="!equippedDetails.weapon"
                  class="equip-slot-button"
                  @click="selectedEquipmentSlot = selectedEquipmentSlot === 'weapon' ? null : 'weapon'">
                  ⚙️ EQUIP
                </button>
              </div>
            </div>
          </div>

          <!-- Inventory Items Section - Only shows when a slot is selected -->
          <div v-if="selectedEquipmentSlot" class="inventory-section">
            <h3>📦 Select {{ selectedEquipmentSlot.toUpperCase() }} Item</h3>
            <div v-if="getFilteredInventoryBySlot(selectedEquipmentSlot).length === 0" class="empty-message">
              <p>No items available for this slot</p>
            </div>
            <div v-else class="equipment-items-grid">
              <div 
                v-for="item in getFilteredInventoryBySlot(selectedEquipmentSlot)" 
                :key="`${item.type}-${item.name}`"
                class="equipment-item-card">
                <div class="item-header">
                  <h4>{{ item.name }}</h4>
                  <p class="item-type">{{ item.type }}</p>
                </div>
                <img v-if="item.image" :src="item.image" :alt="item.name" class="equipment-item-image">
                <p class="equipment-stat-badge">+{{ item.hp }} HP</p>
                <p v-if="item.description" class="item-description">{{ item.description }}</p>
                <button 
                  class="equip-item-button"
                  @click="equipFromInventory(item)">
                  EQUIP
                </button>
              </div>
            </div>
          </div>

          <!-- Unequip All Button -->
          <div class="unequip-all-section">
            <button 
              v-if="currentEquipped.head || currentEquipped.armor || currentEquipped.foot || currentEquipped.weapon"
              class="unequip-all-button"
              @click="unequipAll">
              🔓 UNEQUIP ALL
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase.js'

export default {
  name: 'CapitalView',
  data() {
    return {
      showFirstVideo: true,
      showSecondVideo: false,
      showTutorial: false,
      showMarket: false,
      showEquipment: false,
      marketTab: 'shop',
      equipmentFilter: 'all',
      inventoryFilter: 'all',
      sellFilter: 'all',
      selectedEquipmentSlot: null,
      playerLevel: 1,
      playerExp: 0,
      expToNextLevel: 100,
      playerGold: 500,
      playerHp: 100,
      maxHp: 100,
      currentUsername: '',
      currentUserIdFromCredentials: null,
      userInfoId: null,  // Store userInfo table ID for real-time subscription
      statsSubscription: null,  // Real-time subscription handle
      isFetchingStats: false,  // Prevent simultaneous fetches
      // Button Positions - PERCENTAGE-BASED FOR DYNAMIC SIZING
      marketButtonPos: {
        top: '72%',
        left: '50%'
      },
      tutorialButtonPos: {
        top: '16%',
        left: '35.5%'
      },
      equipmentButtonPos: {
        top: '36%',
        left: '83.5%'
      },
      // Market items from Supabase Shop table
      shopItems: [],
      adminShopItems: [],  // Admin-generated items
      userShopItems: [],   // User-sold items
      userInventory: [],
      // Equipment management
      currentEquipped: {
        head: null,      // Store inventory table ID
        armor: null,     // Store inventory table ID
        foot: null,      // Store inventory table ID
        weapon: null     // Store inventory table ID
      },
      equippedDetails: {
        head: null,      // Store full item details
        armor: null,     // Store full item details
        foot: null,      // Store full item details
        weapon: null     // Store full item details
      },
      availableHead: [],
      availableArmor: [],
      availableFoot: [],
      availableWeapon: [],
      buffItems: [
        {
          id: 1,
          name: 'Strength Potion',
          icon: '💪',
          description: 'Boost your damage',
          type: 'DAMAGE',
          bonus: 50,
          duration: 60,
          price: 100
        },
        {
          id: 2,
          name: 'Defense Spell',
          icon: '🛡️',
          description: 'Reduce incoming damage',
          type: 'DEFENSE',
          bonus: 30,
          duration: 45,
          price: 120
        },
        {
          id: 3,
          name: 'Wisdom Scroll',
          icon: '📜',
          description: 'Better answers, more XP',
          type: 'EXP',
          bonus: 25,
          duration: 30,
          price: 150
        }
      ],
      sellForm: {
        selectedItemIndex: null,
        type: '',
        name: '',
        description: '',
        icon: '',
        bonus: 0,
        price: 0
      },
      // Shop search and filter
      shopSearchQuery: '',
      shopFilterType: '',
      shopDisplayMode: 'all', // 'all', 'admin', or 'user'
      // Buffs
      showBuffs: false,
      // Notification system
      notification: {
        show: false,
        message: '',
        type: 'success' // 'success', 'error', 'info'
      },
      // Audio control
      isMuted: false
    }
  },
  async mounted() {
    // Get current user from localStorage
    try {
      const currentUserStr = localStorage.getItem('currentUser')
      let currentUser = {}
      
      if (currentUserStr) {
        try {
          currentUser = JSON.parse(currentUserStr)
        } catch (parseError) {
          console.warn('Invalid JSON in currentUser localStorage:', currentUserStr)
          // If it's a plain string (like "carydpogs"), use it as username
          if (typeof currentUserStr === 'string') {
            currentUser.username = currentUserStr
          }
        }
      }
      
      this.currentUsername = currentUser.username || 'Unknown'
      console.log('Current username:', this.currentUsername)
      
      // Fetch current user ID from Credentials table
      const { data: credData } = await supabase
        .from('Credentials')
        .select('id')
        .eq('username', this.currentUsername)
        .single()
      
      if (credData) {
        this.currentUserIdFromCredentials = credData.id
        console.log('Current user ID:', this.currentUserIdFromCredentials)
      }
    } catch (err) {
      console.error('Error reading currentUser from localStorage:', err)
      this.currentUsername = 'Unknown'
    }
    
    // Fetch shop items from Supabase
    await this.fetchShopItems()
    
    // Fetch user inventory and equipped items
    await this.fetchUserInventory()
    await this.fetchEquippedItems()
    
    // Fetch player stats (level, xp, gold, hp) from userInfo table
    await this.fetchPlayerStats()
    
    // Set up real-time subscription for player stats
    await this.subscribeToPlayerStatsChanges()

    // Initialize audio
    this.isMuted = localStorage.getItem('capitalMuted') === 'true'
    document.addEventListener('click', () => this.playAudio(), { once: true })
    // Ensure audio element muted state is synced
    this.$nextTick(() => {
      const audio = this.$refs.bgAudio
      if (audio) audio.muted = this.isMuted
    })

    // Listen for page visibility changes to refresh stats when returning to the tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('📍 Page became visible - refreshing player stats')
        this.fetchPlayerStats()
      }
    })

    // Also refresh stats every 5 seconds to catch updates from other tabs
    setInterval(() => {
      this.fetchPlayerStats()
    }, 5000)
  },
  beforeUnmount() {
    // Clean up real-time subscription when leaving the page
    if (this.statsSubscription) {
      console.log('🔌 Unsubscribing from player stats updates')
      supabase.removeChannel(this.statsSubscription)
      this.statsSubscription = null
    }
  },
  computed: {
    // Calculate maxHp as base HP from database + sum of all equipped item bonuses
    calculatedMaxHp() {
      let baseHp = this.maxHp || 100  // Use maxHp from database (which includes level-up bonuses)
      let bonus = 0
      
      // Sum HP bonuses from all equipped items
      try {
        if (this.equippedDetails?.head?.hp) {
          bonus += this.equippedDetails.head.hp
        }
        if (this.equippedDetails?.armor?.hp) {
          bonus += this.equippedDetails.armor.hp
        }
        if (this.equippedDetails?.foot?.hp) {
          bonus += this.equippedDetails.foot.hp
        }
        if (this.equippedDetails?.weapon?.hp) {
          bonus += this.equippedDetails.weapon.hp
        }
      } catch (err) {
        console.error('Error calculating max HP:', err)
      }
      
      const total = baseHp + bonus
      return total
    },
    // Filter shop items by search query and selected type
    filteredShopItems() {
      let filtered = this.shopItems
      
      // Apply search filter
      if (this.shopSearchQuery.trim()) {
        const query = this.shopSearchQuery.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
        )
      }
      
      // Apply type filter
      if (this.shopFilterType) {
        filtered = filtered.filter(item => 
          item.type.toLowerCase() === this.shopFilterType.toLowerCase()
        )
      }
      
      return filtered
    },
    // Filter admin shop items
    filteredAdminShopItems() {
      let filtered = this.adminShopItems
      
      // Apply search filter
      if (this.shopSearchQuery.trim()) {
        const query = this.shopSearchQuery.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
        )
      }
      
      // Apply type filter
      if (this.shopFilterType) {
        filtered = filtered.filter(item => 
          item.type.toLowerCase() === this.shopFilterType.toLowerCase()
        )
      }
      
      return filtered
    },
    // Filter user shop items
    filteredUserShopItems() {
      let filtered = this.userShopItems
      
      // Apply search filter
      if (this.shopSearchQuery.trim()) {
        const query = this.shopSearchQuery.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
        )
      }
      
      // Apply type filter
      if (this.shopFilterType) {
        filtered = filtered.filter(item => 
          item.type.toLowerCase() === this.shopFilterType.toLowerCase()
        )
      }
      
      return filtered
    }
  },
  watch: {
    '$route'(to, from) {
      // Refresh player stats when navigating to capital from another route
      if (to.path === '/capital') {
        console.log('📍 Returned to capital - refreshing player stats')
        // Add a small delay to ensure database is updated
        setTimeout(() => {
          this.fetchPlayerStats()
          this.fetchEquippedItems()
        }, 500)
      }
    }
  },
  methods: {
    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message: message,
        type: type
      }
      // Auto-hide after 3 seconds
      setTimeout(() => {
        this.notification.show = false
      }, 3000)
    },
    playAudio() {
      const audio = this.$refs.bgAudio
      if (audio) {
        audio.muted = this.isMuted
        // Add fade-in animation
        audio.style.opacity = '0'
        audio.play().catch(error => {
          console.log("Audio play failed:", error)
        })
        // Fade in the audio volume over 2 seconds
        setTimeout(() => {
          audio.style.transition = 'opacity 2s ease-in'
          audio.style.opacity = '1'
        }, 100)
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted
      try {
        const audio = this.$refs.bgAudio
        if (audio) {
          audio.muted = this.isMuted
          // If unmuting and audio is paused, try to play
          if (!this.isMuted && audio.paused) {
            audio.play().catch(() => {})
          }
        }
      } catch (e) {
        console.warn('Audio toggle error:', e)
      }
      localStorage.setItem('capitalMuted', this.isMuted ? 'true' : 'false')
    },
    skipVideo() {
      this.showFirstVideo = false
      this.showSecondVideo = false
    },
    firstVideoEnded() {
      this.showFirstVideo = false
      // Start second video after a brief fade
      setTimeout(() => {
        this.showSecondVideo = true
      }, 100)
    },
    secondVideoEnded() {
      this.showSecondVideo = false
      // Start playing audio after videos end
      setTimeout(() => {
        this.playAudio()
      }, 500)
    },
    async fetchShopItems() {
      try {
        // Fetch from all 4 tables
        const [headResult, bodyResult, footResult, weaponResult] = await Promise.all([
          supabase.from('headGear').select('*'),
          supabase.from('bodyGear').select('*'),
          supabase.from('footGear').select('*'),
          supabase.from('weaponGear').select('*')
        ])
        
        // Log all results for debugging
        console.log('=== SHOP DATA FETCH RESULTS ===')
        console.log('Head Gear:', headResult)
        console.log('Body Gear:', bodyResult)
        console.log('Foot Gear:', footResult)
        console.log('Weapon Gear:', weaponResult)
        
        // Check for errors from each table
        if (headResult.error) console.error('HeadGear Error:', headResult.error)
        if (bodyResult.error) console.error('BodyGear Error:', bodyResult.error)
        if (footResult.error) console.error('FootGear Error:', footResult.error)
        if (weaponResult.error) console.error('WeaponGear Error:', weaponResult.error)
        
        // Combine all data
        const allData = {
          headGear: headResult.data || [],
          bodyGear: bodyResult.data || [],
          footGear: footResult.data || [],
          weaponGear: weaponResult.data || []
        }
        
        console.log('Combined shop items count:', Object.values(allData).reduce((sum, arr) => sum + arr.length, 0))
        
        // Transform into items
        const allShopItems = this.transformShopData(allData)
        
        // Debug: Log all items with their source values
        console.log('🔍 === ALL SHOP ITEMS SOURCE DEBUG ===')
        allShopItems.forEach((item, idx) => {
          console.log(`Item ${idx}: ${item.name} | source="${item.source}" | type: ${typeof item.source}`)
        })
        
        // Separate admin and user items
        this.adminShopItems = allShopItems.filter(item => item.source === 'admin' || !item.source)
        this.userShopItems = allShopItems.filter(item => item.source === 'user')
        
        // Keep all items in shopItems for backward compatibility
        this.shopItems = allShopItems
        
        console.log('✅ Admin shop items:', this.adminShopItems)
        console.log('✅ User shop items:', this.userShopItems)
      } catch (err) {
        console.error('Exception fetching shop items:', err)
        console.error('Stack trace:', err.stack)
        alert('Error loading shop items. Check console for details.')
      }
    },
    transformShopData(data) {
      const items = []
      let idCounter = 0
      
      // Process headGear table
      data.headGear.forEach((row, index) => {
        if (row.head && row.stock > 0) {
          items.push({
            id: idCounter++,
            sourceId: row.id,
            name: row.head,
            type: 'HEAD GEAR',
            price: row.price || 0,
            stock: row.stock || 0,
            bonus: row.bonus !== undefined ? row.bonus : (Math.floor((row.price || 0) / 10) || 5),
            icon: '⚙️',
            description: row.description || 'Head protection',
            image: row.image || null,
            tableName: 'headGear',
            userId: row.userId || null,
            source: row.source || null
          })
        } else if (row.head && row.stock === 0) {
          console.log('HeadGear item out of stock:', row.head)
        } else {
          console.warn('HeadGear item has empty head field:', row)
        }
      })
      
      // Process bodyGear table
      data.bodyGear.forEach((row, index) => {
        if (row.body && row.stock > 0) {
          items.push({
            id: idCounter++,
            sourceId: row.id,
            name: row.body,
            type: 'BODY GEAR',
            price: row.price || 0,
            stock: row.stock || 0,
            bonus: row.bonus !== undefined ? row.bonus : (Math.floor((row.price || 0) / 10) || 5),
            icon: '🛡️',
            description: row.description || 'Body armor',
            image: row.image || null,
            tableName: 'bodyGear',
            userId: row.userId || null,
            source: row.source || null
          })
        } else if (row.body && row.stock === 0) {
          console.log('BodyGear item out of stock:', row.body)
        } else {
          console.warn('BodyGear item has empty body field:', row)
        }
      })
      
      // Process footGear table
      console.log('=== PROCESSING FOOTGEAR TABLE ===')
      console.log('Total footGear rows:', data.footGear.length)
      data.footGear.forEach((row, index) => {
        console.log(`FootGear Row ${index}:`, {
          foot: row.foot,
          price: row.price,
          stock: row.stock,
          description: row.description,
          image: row.image,
          allFields: Object.keys(row)
        })
        if (row.foot && row.stock > 0) {
          console.log('✅ Adding footGear item:', row.foot, '- Stock:', row.stock)
          items.push({
            id: idCounter++,
            sourceId: row.id,
            name: row.foot,
            type: 'FOOT GEAR',
            price: row.price || 0,
            stock: row.stock || 0,
            bonus: row.bonus !== undefined ? row.bonus : (Math.floor((row.price || 0) / 10) || 5),
            icon: '👢',
            description: row.description || 'Foot protection',
            image: row.image || null,
            tableName: 'footGear',
            userId: row.userId || null,
            source: row.source || null
          })
        } else if (row.foot && row.stock === 0) {
          console.log('FootGear item out of stock:', row.foot)
        } else {
          console.warn('❌ FootGear item has empty foot field:', row)
        }
      })
      
      // Process weaponGear table
      data.weaponGear.forEach((row, index) => {
        if (row.weapon && row.stock > 0) {
          items.push({
            id: idCounter++,
            sourceId: row.id,
            name: row.weapon,
            type: 'WEAPON GEAR',
            price: row.price || 0,
            stock: row.stock || 0,
            bonus: row.bonus !== undefined ? row.bonus : (Math.floor((row.price || 0) / 10) || 5),
            icon: '⚔️',
            description: row.description || 'Weapon',
            image: row.image || null,
            tableName: 'weaponGear',
            userId: row.userId || null,
            source: row.source || null
          })
        } else if (row.weapon && row.stock === 0) {
          console.log('WeaponGear item out of stock:', row.weapon)
        } else {
          console.warn('WeaponGear item has empty weapon field:', row)
        }
      })
      
      return items
    },
    goBack() {
      // Skip videos if any are playing
      this.showFirstVideo = false
      this.showSecondVideo = false
      
      const container = document.querySelector('.capital-container')
      if (container) {
        container.classList.add('fade-out-page')
        setTimeout(() => {
          this.$router.push('/map')
        }, 500)
      } else {
        this.$router.push('/map')
      }
    },
    openTutorial() {
      this.showTutorial = true
    },
    closeTutorial() {
      this.showTutorial = false
    },
    async openMarket() {
      this.showMarket = true
      this.marketTab = 'shop'
      // Reload shop items and inventory data from Supabase
      await this.fetchShopItems()
      await this.fetchUserInventory()
      await this.fetchPlayerGold()
    },
    closeMarket() {
      this.showMarket = false
    },
    async buyItem(item) {
      try {
        // Determine the inventory table based on item type
        let invTable = ''
        let invColumn = ''
        let sourceTable = ''

        if (item.type === 'HEAD GEAR') {
          invTable = 'headinv'
          invColumn = 'head!Equipped'
          sourceTable = 'headGear'
        } else if (item.type === 'BODY GEAR') {
          invTable = 'bodyinv'
          invColumn = 'body!Equipped'
          sourceTable = 'bodyGear'
        } else if (item.type === 'FOOT GEAR') {
          invTable = 'footinv'
          invColumn = 'foot!Equipped'
          sourceTable = 'footGear'
        } else if (item.type === 'WEAPON GEAR') {
          invTable = 'weaponinv'
          invColumn = 'weapon!Equipped'
          sourceTable = 'weaponGear'
        }

        if (!invTable) {
          alert('Invalid item type')
          return
        }

        console.log('=== BUYING ITEM ===')
        console.log('Item:', item.name)
        console.log('Inventory Table:', invTable)
        console.log('Inventory Column:', invColumn)
        console.log('Source Table:', sourceTable)

        // Get buyer's user ID from Credentials table
        console.log('Step 0: Fetching buyer ID from Credentials table...')
        const { data: buyerCredData, error: buyerCredError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (buyerCredError) {
          console.error('Error fetching buyer ID:', buyerCredError)
          alert('Failed to identify buyer')
          return
        }
        
        const buyerId = buyerCredData?.id
        console.log('✅ Buyer ID found:', buyerId)

        // Step 1: Fetch item details from source table to get current price and description
        console.log('Step 1: Fetching item details from', sourceTable)
        const { data: itemData, error: itemError } = await supabase
          .from(sourceTable)
          .select('*')
          .eq('id', item.sourceId || item.id)
          .single()

        if (itemError) {
          console.error('Error fetching item details:', itemError)
          alert('Failed to find item details')
          return
        }

        const itemPrice = itemData.price
        const itemDescription = itemData.description
        let sellerId = itemData.userId || itemData.userid || null
        
        console.log('✅ Item price from DB:', itemPrice)
        console.log('✅ Item description from DB:', itemDescription)
        console.log('✅ Seller ID from itemData.userId:', sellerId)
        console.log('✅ Full item data:', itemData)

        // Check if buyer is trying to buy their own item
        if (sellerId && sellerId === buyerId) {
          alert('You cannot buy your own listed items! You can cancel the listing instead.')
          return
        }

        // Check if buyer has enough gold
        if (this.playerGold < itemPrice) {
          alert('Not enough gold!')
          return
        }

        // Step 2: Deduct stock from source table
        console.log('Step 2: Updating stock in', sourceTable)
        const newStock = itemData.stock - 1
        const updateStockData = { stock: newStock }
        
        // If stock reaches 0, also clear userId and price (remove from shop)
        if (newStock <= 0) {
          updateStockData.userId = null
          updateStockData.price = null
          console.log('Stock will reach 0, clearing userId and price')
        }
        
        const { error: stockError } = await supabase
          .from(sourceTable)
          .update(updateStockData)
          .eq('id', item.sourceId || item.id)

        if (stockError) {
          console.error('Error updating stock:', stockError)
          alert('Failed to update stock')
          return
        }
        console.log('✅ Stock updated successfully')

        // Step 3: Insert into buyer's inventory table with correct description
        console.log('Step 3: Inserting into', invTable)
        const inventoryData = {
          userId: buyerId,
          [invColumn]: item.name,
          image: item.image,
          descriptionId: itemData.id
        }
        console.log('Inventory data:', inventoryData)

        const { error: insertError } = await supabase
          .from(invTable)
          .insert([inventoryData])

        if (insertError) {
          console.error('Error adding to inventory:', insertError)
          alert(`Failed to add item to inventory: ${insertError.message}`)
          return
        }
        console.log('✅ Item inserted successfully')

        // Step 4: Update buyer's gold in userInfo table
        console.log('Step 4: Updating buyer gold in userInfo...')
        const { data: buyerInfo, error: buyerFetchError } = await supabase
          .from('userInfo')
          .select('gold')
          .eq('userId', buyerId)
          .single()

        if (buyerFetchError) {
          console.error('Error fetching buyer info:', buyerFetchError)
          alert('Failed to update your gold')
          return
        }

        const newBuyerGold = (buyerInfo.gold || 0) - itemPrice
        const { error: buyerUpdateError } = await supabase
          .from('userInfo')
          .update({ gold: newBuyerGold })
          .eq('userId', buyerId)

        if (buyerUpdateError) {
          console.error('Error updating buyer gold:', buyerUpdateError)
          alert('Failed to deduct gold')
          return
        }

        // Update local UI gold immediately
        this.playerGold = newBuyerGold
        console.log('✅ Buyer gold deducted. New gold:', newBuyerGold)

        // Step 5: Add gold to seller if seller exists
        if (sellerId) {
          console.log('Step 5: Adding gold to seller...')
          console.log('Seller ID:', sellerId)
          const { data: sellerInfo, error: sellerFetchError } = await supabase
            .from('userInfo')
            .select('gold')
            .eq('userId', sellerId)
            .single()

          if (sellerFetchError) {
            console.error('Error fetching seller info:', sellerFetchError)
            console.error('Seller ID attempted:', sellerId)
          } else if (sellerInfo) {
            const newSellerGold = (sellerInfo.gold || 0) + itemPrice
            console.log('Seller current gold:', sellerInfo.gold, 'Adding:', itemPrice, 'New gold:', newSellerGold)
            const { error: sellerUpdateError } = await supabase
              .from('userInfo')
              .update({ gold: newSellerGold })
              .eq('userId', sellerId)

            if (sellerUpdateError) {
              console.error('Error updating seller gold:', sellerUpdateError)
              console.error('Seller update details - ID:', sellerId, 'New gold:', newSellerGold)
            } else {
              console.log('✅ Added', itemPrice, 'gold to seller. Seller new gold:', newSellerGold)
            }
          } else {
            console.warn('⚠️ No seller info found for ID:', sellerId)
          }
        } else {
          console.warn('⚠️ No seller ID found for this item')
        }

        this.showNotification(`✅ You bought ${item.name} for ${itemPrice} gold!`, 'success')
        
        // Refresh shop items and inventory (no need to refresh gold since we already updated it)
        await this.fetchShopItems()
        await this.fetchUserInventory()
      } catch (err) {
        console.error('Exception buying item:', err)
        console.error('Error stack:', err.stack)
        alert('Error buying item')
      }
    },
    async listItem() {
      if (this.sellForm.selectedItemIndex === null) {
        alert('Please select an item from your inventory')
        return
      }

      if (!this.sellForm.price || this.sellForm.price <= 0) {
        alert('Please set a valid selling price')
        return
      }

      try {
        const selectedItem = this.userInventory[this.sellForm.selectedItemIndex]
        
        console.log('🔍 Checking if item is equipped before listing...')
        console.log('Selected item details:', { 
          name: selectedItem.name, 
          table: selectedItem.table, 
          id: selectedItem.id 
        })
        
        // Re-check if item is equipped (in case it was equipped after selection)
        const isEquipped = await this.isInventoryItemEquipped(selectedItem.table, selectedItem.id)
        console.log('Is item equipped?', isEquipped)
        
        if (isEquipped) {
          alert('❌ You cannot sell an item that is currently equipped!\nUnequip it first.')
          return
        }
        
        // Get user ID
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching user ID:', credError)
          alert('Failed to identify user')
          return
        }
        
        const userId = credData?.id
        
        // Determine the correct table and column based on item type
        let shopTableName = ''
        let invTableName = ''
        let invColumn = ''
        let nameColumn = ''
        
        if (selectedItem.type === 'HEAD GEAR') {
          shopTableName = 'headGear'
          invTableName = 'headinv'
          invColumn = 'head!Equipped'
          nameColumn = 'head'
        } else if (selectedItem.type === 'BODY GEAR') {
          shopTableName = 'bodyGear'
          invTableName = 'bodyinv'
          invColumn = 'body!Equipped'
          nameColumn = 'body'
        } else if (selectedItem.type === 'FOOT GEAR') {
          shopTableName = 'footGear'
          invTableName = 'footinv'
          invColumn = 'foot!Equipped'
          nameColumn = 'foot'
        } else if (selectedItem.type === 'WEAPON GEAR') {
          shopTableName = 'weaponGear'
          invTableName = 'weaponinv'
          invColumn = 'weapon!Equipped'
          nameColumn = 'weapon'
        }
        
        if (!shopTableName) {
          alert('Invalid item type for selling')
          return
        }

        // Fetch the original item from inventory to get descriptionId
        console.log('Fetching original item details from inventory...')
        console.log('invTableName:', invTableName, 'userId:', userId, 'invColumn:', invColumn)
        const { data: invItems, error: invFetchError } = await supabase
          .from(invTableName)
          .select('*')
          .eq('userId', userId)
        
        if (invFetchError) {
          console.error('Error fetching inventory items:', invFetchError)
          alert('Failed to fetch item details')
          return
        }

        console.log('Fetched invItems:', invItems)
        console.log('Looking for item name:', selectedItem.name)

        // Find the matching item with correct descriptionId
        let originalGearRow = null
        let rowIdToDelete = null
        
        if (invItems && invItems.length > 0) {
          console.log('Number of inventory items found:', invItems.length)
          for (let item of invItems) {
            console.log('Checking inventory item:', { 
              inventoryRowId: item.id,
              selectedItemId: selectedItem.id,
              match: item.id === selectedItem.id
            })
            // Match by unique inventory ID, not by name (so we can sell identical items)
            if (item.id === selectedItem.id) {
              console.log('✅ Found matching inventory item by ID!')
              rowIdToDelete = item.id
              
              // Fetch the full gear row data
              const { data: gearRow, error: gearError } = await supabase
                .from(shopTableName)
                .select('*')
                .eq('id', item.descriptionId)
                .single()
              
              if (gearError) {
                console.error('Error fetching gear row:', gearError)
                alert('Failed to fetch item details')
                return
              }
              
              originalGearRow = gearRow
              console.log('✅ Found original gear row:', originalGearRow)
              break
            }
          }
        }

        if (!originalGearRow) {
          console.error('Could not find gear table row for item')
          alert('Could not find item details')
          return
        }

        console.log('Listing item for sale:', { shopTableName, price: this.sellForm.price })
        
        // Step 1: CREATE A NEW ROW in the gear table (don't update the original)
        console.log('Step 1: Creating new row in gear table for listed item...')
        // Find the original descriptionId from the inventory item
        let originalDescriptionId = null
        if (invItems && invItems.length > 0) {
          for (let item of invItems) {
            if (item[invColumn] === selectedItem.name) {
              originalDescriptionId = item.descriptionId
              console.log('✅ Original descriptionId:', originalDescriptionId)
              break
            }
          }
        }
        
        // Copy all fields from original gear row, then override specific fields
        const newListedRow = {
          ...originalGearRow,  // Copy all original fields
          [nameColumn]: originalGearRow[nameColumn],
          price: this.sellForm.price,
          stock: 1,
          userId: userId,  // Set to current user so they can see and cancel the listing
          originalDescriptionId: originalDescriptionId,  // Store the original item ID for later reference
          source: 'user'  // Mark as user-listed item
        }
        
        // Debug: Log what we're copying
        console.log('Original gear row fields:', Object.keys(originalGearRow))
        console.log('Original hp value:', originalGearRow.hp)
        console.log('New listed row before cleanup:', newListedRow)
        
        // Remove only the ID fields that would conflict with new row creation
        delete newListedRow.id
        delete newListedRow.created_at
        delete newListedRow.updated_at  // Remove timestamp so Supabase creates new one
        
        console.log('New listed row after cleanup:', newListedRow)
        console.log('HP value in new row:', newListedRow.hp)
        
        const { error: insertError } = await supabase
          .from(shopTableName)
          .insert([newListedRow])

        if (insertError) {
          console.error('Error listing item:', insertError)
          console.error('Full error object:', insertError)
          console.error('Error message:', insertError.message)
          console.error('Error details:', insertError.details)
          alert(`Failed to list item: ${insertError.message || 'Unknown error'}`)
          return
        }
        
        console.log('✅ New item row created in gear table successfully')
        
        // Step 2: Unequip the item if it's currently equipped
        if (selectedItem.table === 'headinv') {
          console.log('Step 2a: Unequipping head item if equipped...')
          const { error: unequipError } = await supabase
            .from('Equipped')
            .update({ headEquipped: null })
            .eq('headEquipped', selectedItem.id)
          
          if (unequipError) {
            console.warn('Warning unequipping head item:', unequipError)
          }
        } else if (selectedItem.table === 'bodyinv') {
          console.log('Step 2a: Unequipping body item if equipped...')
          const { error: unequipError } = await supabase
            .from('Equipped')
            .update({ bodyEquipped: null })
            .eq('bodyEquipped', selectedItem.id)
          
          if (unequipError) {
            console.warn('Warning unequipping body item:', unequipError)
          }
        } else if (selectedItem.table === 'footinv') {
          console.log('Step 2a: Unequipping foot item if equipped...')
          const { error: unequipError } = await supabase
            .from('Equipped')
            .update({ footEquipped: null })
            .eq('footEquipped', selectedItem.id)
          
          if (unequipError) {
            console.warn('Warning unequipping foot item:', unequipError)
          }
        } else if (selectedItem.table === 'weaponinv') {
          console.log('Step 2a: Unequipping weapon item if equipped...')
          const { error: unequipError } = await supabase
            .from('Equipped')
            .update({ weaponEquipped: null })
            .eq('weaponEquipped', selectedItem.id)
          
          if (unequipError) {
            console.warn('Warning unequipping weapon item:', unequipError)
          }
        }
        
        // Step 3: Delete the item from inventory table
        if (rowIdToDelete) {
          console.log('Step 3: Deleting item with ID:', rowIdToDelete, 'from', invTableName)
          
          const { error: deleteError } = await supabase
            .from(invTableName)
            .delete()
            .eq('id', rowIdToDelete)

          if (deleteError) {
            console.error('Error deleting from inventory:', deleteError)
            alert('Item listed but failed to remove from inventory. Please refresh.')
            return
          }
          console.log('✅ Item deleted from inventory successfully')
        } else {
          console.warn('Could not find item in inventory to delete')
        }

        alert(`${selectedItem.name} listed successfully for ${this.sellForm.price} gold!`)
        
        // Remove item from inventory array
        this.userInventory.splice(this.sellForm.selectedItemIndex, 1)
        
        // Reset form
        this.sellForm = {
          selectedItemIndex: null,
          type: '',
          name: '',
          description: '',
          icon: '',
          bonus: 0,
          price: 0
        }
        
        // Refresh both shop items and inventory
        await this.fetchShopItems()
        await this.fetchUserInventory()
      } catch (err) {
        console.error('Exception listing item:', err)
        alert('Error listing item')
      }
    },
    async cancelListing(item) {
      try {
        const confirmed = confirm(`Are you sure you want to cancel the listing for "${item.name}"?`)
        if (!confirmed) return

        console.log('=== CANCELING LISTING ===')
        console.log('Item:', item.name)
        console.log('Shop table:', item.tableName)
        console.log('Item source ID:', item.sourceId)

        // Determine shop table name and inventory table
        let shopTableName = item.tableName || 'footGear' // fallback
        let invTableName = ''
        let invColumn = ''
        
        if (shopTableName === 'headGear') {
          invTableName = 'headinv'
          invColumn = 'head!Equipped'
        } else if (shopTableName === 'bodyGear') {
          invTableName = 'bodyinv'
          invColumn = 'body!Equipped'
        } else if (shopTableName === 'footGear') {
          invTableName = 'footinv'
          invColumn = 'foot!Equipped'
        } else if (shopTableName === 'weaponGear') {
          invTableName = 'weaponinv'
          invColumn = 'weapon!Equipped'
        }

        // Get the current user ID
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching user ID:', credError)
          alert('Failed to identify user')
          return
        }
        
        const userId = credData?.id
        console.log('Current user ID:', userId)

        // Step 1: Fetch the full item details from the gear table
        console.log('Step 1: Fetching item details from', shopTableName)
        const { data: listedItem, error: fetchError } = await supabase
          .from(shopTableName)
          .select('*')
          .eq('id', item.sourceId || item.id)
          .single()

        if (fetchError) {
          console.error('Error fetching item:', fetchError)
          alert('Failed to fetch item details')
          return
        }

        console.log('✅ Item details fetched:', listedItem)

        // Step 2: Re-insert the item back into the user's inventory
        console.log('Step 2: Re-inserting item into', invTableName)
        const inventoryData = {
          userId: userId,
          [invColumn]: item.name,
          image: item.image,
          descriptionId: listedItem.originalDescriptionId || item.sourceId || item.id  // Use stored original ID
        }
        console.log('Inventory data:', inventoryData)

        const { error: insertError } = await supabase
          .from(invTableName)
          .insert([inventoryData])

        if (insertError) {
          console.error('Error re-inserting to inventory:', insertError)
          alert('Failed to restore item to inventory')
          return
        }

        console.log('✅ Item re-inserted to inventory successfully')

        // Step 3: Delete the listed row from the gear table
        console.log('Step 3: Deleting listed row from', shopTableName)
        const { error: deleteError } = await supabase
          .from(shopTableName)
          .delete()
          .eq('id', item.sourceId || item.id)

        if (deleteError) {
          console.error('Error deleting listing from shop:', deleteError)
          alert('Listing cancelled but failed to remove from shop. Please refresh.')
          return
        }

        console.log('✅ Listed row deleted from shop successfully')
        alert(`"${item.name}" listing has been cancelled and item returned to your inventory!`)

        // Refresh shop items and inventory to update the display
        await this.fetchShopItems()
        await this.fetchUserInventory()
      } catch (err) {
        console.error('Exception canceling listing:', err)
        alert('Error canceling listing')
      }
    },
    activateBuff(buff) {
      if (this.playerGold >= buff.price) {
        this.playerGold -= buff.price
        alert(`${buff.name} activated! +${buff.bonus}% for ${buff.duration}s`)
        // Apply buff effects (future implementation)
      } else {
        alert('Not enough gold!')
      }
    },
    async openEquipment() {
      this.showEquipment = true
      // Reload equipment and inventory data from Supabase
      await this.fetchUserInventory()
      await this.fetchEquippedItems()
      await this.fetchPlayerGold()
    },
    closeEquipment() {
      this.showEquipment = false
    },
    getFilteredInventory() {
      if (this.equipmentFilter === 'all') {
        return this.userInventory
      }
      
      let typeFilter = ''
      if (this.equipmentFilter === 'head') {
        typeFilter = 'HEAD GEAR'
      } else if (this.equipmentFilter === 'body') {
        typeFilter = 'BODY GEAR'
      } else if (this.equipmentFilter === 'foot') {
        typeFilter = 'FOOT GEAR'
      } else if (this.equipmentFilter === 'weapon') {
        typeFilter = 'WEAPON GEAR'
      }
      
      return this.userInventory.filter(item => item.type === typeFilter)
    },
    getFilteredInventoryBySlot(slot) {
      let typeFilter = ''
      if (slot === 'head') {
        typeFilter = 'HEAD GEAR'
      } else if (slot === 'armor') {
        typeFilter = 'BODY GEAR'
      } else if (slot === 'foot') {
        typeFilter = 'FOOT GEAR'
      } else if (slot === 'weapon') {
        typeFilter = 'WEAPON GEAR'
      }
      
      return this.userInventory.filter(item => item.type === typeFilter)
    },
    getFilteredMarketInventory() {
      if (this.inventoryFilter === 'all') {
        return this.userInventory
      }
      
      let typeFilter = ''
      if (this.inventoryFilter === 'head') {
        typeFilter = 'HEAD GEAR'
      } else if (this.inventoryFilter === 'body') {
        typeFilter = 'BODY GEAR'
      } else if (this.inventoryFilter === 'foot') {
        typeFilter = 'FOOT GEAR'
      } else if (this.inventoryFilter === 'weapon') {
        typeFilter = 'WEAPON GEAR'
      }
      
      return this.userInventory.filter(item => item.type === typeFilter)
    },
    getFilteredSellInventory() {
      if (this.sellFilter === 'all') {
        return this.userInventory
      }
      
      let typeFilter = ''
      if (this.sellFilter === 'head') {
        typeFilter = 'HEAD GEAR'
      } else if (this.sellFilter === 'body') {
        typeFilter = 'BODY GEAR'
      } else if (this.sellFilter === 'foot') {
        typeFilter = 'FOOT GEAR'
      } else if (this.sellFilter === 'weapon') {
        typeFilter = 'WEAPON GEAR'
      }
      
      return this.userInventory.filter(item => item.type === typeFilter)
    },
    getOriginalInventoryIndex(item) {
      // Create a unique composite key: table + id (since each table has its own ID sequence)
      const compositeKey = `${item.table}-${item.id}`
      const index = this.userInventory.findIndex(invItem => 
        `${invItem.table}-${invItem.id}` === compositeKey
      )
      console.log(`getOriginalInventoryIndex - Searching for ${compositeKey}, All IDs in inventory:`, this.userInventory.map(i => `${i.table}-${i.id}`), 'Found at index:', index)
      return index
    },
    async equipFromInventory(item) {
      try {
        console.log('=== EQUIPPING ITEM ===')
        console.log('Item:', item)
        
        // Determine slot and inventory table/column based on item type
        let slotType = ''
        let inventoryTable = ''
        let inventoryColumn = ''
        let gearTable = ''
        let gearColumn = ''
        
        if (item.type === 'HEAD GEAR') {
          slotType = 'head'
          inventoryTable = 'headinv'
          inventoryColumn = 'headEquipped'
          gearTable = 'headGear'
          gearColumn = 'head'
        } else if (item.type === 'BODY GEAR') {
          slotType = 'armor'
          inventoryTable = 'bodyinv'
          inventoryColumn = 'bodyEquipped'
          gearTable = 'bodyGear'
          gearColumn = 'body'
        } else if (item.type === 'FOOT GEAR') {
          slotType = 'foot'
          inventoryTable = 'footinv'
          inventoryColumn = 'footEquipped'
          gearTable = 'footGear'
          gearColumn = 'foot'
        } else if (item.type === 'WEAPON GEAR') {
          slotType = 'weapon'
          inventoryTable = 'weaponinv'
          inventoryColumn = 'weaponEquipped'
          gearTable = 'weaponGear'
          gearColumn = 'weapon'
        }
        
        if (!slotType) {
          alert('Invalid item type')
          return
        }
        
        // Step 1: Get userInfo ID (this is what Equipped.userId references)
        console.log('Step 1: Fetching userInfo ID...')
        
        // First get Credentials ID from username
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching Credentials ID:', credError)
          alert('Failed to identify user')
          return
        }
        
        const credentialId = credData?.id
        console.log('✅ Credential ID found:', credentialId)
        
        // Now fetch userInfo to get the userInfo record ID (primary key)
        const { data: userInfoData, error: userInfoError } = await supabase
          .from('userInfo')
          .select('id, hp')
          .eq('userId', credentialId)
          .single()
        
        if (userInfoError) {
          console.error('Error fetching userInfo:', userInfoError)
          alert('Failed to fetch user info')
          return
        }
        
        const userInfoId = userInfoData?.id
        const currentUserHP = userInfoData?.hp || 0
        console.log('✅ User Info ID found:', userInfoId, 'Current HP:', currentUserHP)
        
        // Step 2: Check if user has an Equipped row (use userInfoId for Equipped table)
        console.log('Step 2: Checking if user has Equipped row...')
        const { data: existingEquipped, error: checkError } = await supabase
          .from('Equipped')
          .select('id')
          .eq('userId', userInfoId)
          .single()
        
        let equippedId = null
        
        if (!existingEquipped) {
          // Step 3a: Create new Equipped row if it doesn't exist
          console.log('Step 3a: Creating new Equipped row...')
          const { data: newEquipped, error: createError } = await supabase
            .from('Equipped')
            .insert([{ userId: userInfoId }])
            .select('id')
            .single()
          
          if (createError) {
            console.error('Error creating Equipped row:', createError)
            alert('Failed to create equipment slot')
            return
          }
          
          equippedId = newEquipped?.id
          console.log('✅ New Equipped row created with ID:', equippedId)
        } else {
          equippedId = existingEquipped.id
          console.log('✅ Existing Equipped row found with ID:', equippedId)
        }
        
        // Step 4: Find the inventory item ID to store
        // We need to find the item in the inventory table that matches this item
        console.log('Step 4: Finding inventory item ID from', inventoryTable)
        
        // Get all items from the inventory table for this user (using credentialId)
        const { data: inventoryItems, error: invError } = await supabase
          .from(inventoryTable)
          .select('*')
          .eq('userId', credentialId)
        
        if (invError) {
          console.error('Error fetching inventory items:', invError)
          alert('Failed to find item in inventory')
          return
        }
        
        // Find the matching item - look for the one that matches the item details
        let inventoryItemId = null
        let itemHPBonus = 0
        
        if (inventoryItems && inventoryItems.length > 0) {
          // Find by matching the descriptionId and visible properties
          for (const invItem of inventoryItems) {
            if (invItem.descriptionId) {
              // Fetch the gear details to verify it matches
              const { data: gearData } = await supabase
                .from(gearTable)
                .select('*')
                .eq('id', invItem.descriptionId)
                .single()
              
              if (gearData && gearData[gearColumn] === item.name) {
                inventoryItemId = invItem.id
                itemHPBonus = gearData.hp || 0
                console.log('✅ Found matching inventory item ID:', inventoryItemId, 'HP bonus:', itemHPBonus)
                break
              }
            }
          }
        }
        
        if (!inventoryItemId) {
          console.error('Item not found in inventory')
          alert('Item not found in inventory')
          return
        }
        
        // Step 5: Update the Equipped table with the inventory item ID
        console.log('Step 5: Updating Equipped table with column', inventoryColumn, 'value', inventoryItemId)
        const updateData = {}
        updateData[inventoryColumn] = inventoryItemId
        
        const { error: updateError } = await supabase
          .from('Equipped')
          .update(updateData)
          .eq('id', equippedId)
        
        if (updateError) {
          console.error('Error updating equipped items:', updateError)
          alert('Failed to equip item')
          return
        }
        
        console.log('✅ Item equipped successfully')
        
        // Step 6: Update local state FIRST so fetchEquippedItemDetails can find the item
        console.log('Step 6a: Updating local equipped state')
        this.currentEquipped[slotType] = inventoryItemId
        
        // Step 6b: Update HP in userInfo by adding the item bonus
        console.log('Step 6b: Updating user HP in database')
        const newHp = currentUserHP + itemHPBonus
        const { error: hpUpdateError } = await supabase
          .from('userInfo')
          .update({ hp: newHp })
          .eq('id', userInfoId)
        
        if (hpUpdateError) {
          console.error('Error updating user HP:', hpUpdateError)
        } else {
          console.log('✅ User HP updated to:', newHp)
          this.playerHp = newHp
        }
        
        // Step 6c: Fetch equipped item details
        await this.fetchEquippedItemDetails()
        
        this.showNotification(`✅ ${item.name} equipped to ${slotType.toUpperCase()} slot!`, 'success')
        
        // Close the equipment slot selector after equipping
        this.selectedEquipmentSlot = null
      } catch (err) {
        console.error('Exception equipping item:', err)
        alert('Error equipping item')
      }
    },
    async unequipAll() {
      try {
        console.log('=== UNEQUIPPING ALL ITEMS ===')
        
        // Step 1: Get Credentials ID from username
        console.log('Step 1: Fetching Credentials ID...')
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching Credentials ID:', credError)
          alert('Failed to identify user')
          return
        }
        
        const credentialId = credData?.id
        console.log('✅ Credential ID found:', credentialId)
        
        // Step 2: Get userInfo ID (this is what Equipped.userId references)
        console.log('Step 2: Fetching userInfo ID and current HP...')
        const { data: userInfoData, error: userInfoError } = await supabase
          .from('userInfo')
          .select('id, hp')
          .eq('userId', credentialId)
          .single()
        
        if (userInfoError) {
          console.error('Error fetching userInfo:', userInfoError)
          alert('Failed to fetch user info')
          return
        }
        
        const userInfoId = userInfoData?.id
        const currentUserHP = userInfoData?.hp || 0
        console.log('✅ User Info ID found:', userInfoId, 'Current HP:', currentUserHP)
        
        // Step 3: Fetch the Equipped row for this user
        console.log('Step 3: Fetching Equipped row...')
        const { data: equippedRow, error: fetchError } = await supabase
          .from('Equipped')
          .select('*')
          .eq('userId', userInfoId)
          .single()
        
        if (fetchError) {
          console.warn('No equipped items found to unequip')
          return
        }
        
        if (!equippedRow) {
          console.log('No equipped row to update')
          return
        }
        
        // Step 4: Calculate total HP bonus to remove
        console.log('Step 4: Calculating total HP bonus to remove...')
        let totalHPBonus = 0
        
        // Map of slots to columns and tables
        const slotMapping = [
          { column: 'headEquipped', table: 'headinv', gearTable: 'headGear' },
          { column: 'bodyEquipped', table: 'bodyinv', gearTable: 'bodyGear' },
          { column: 'footEquipped', table: 'footinv', gearTable: 'footGear' },
          { column: 'weaponEquipped', table: 'weaponinv', gearTable: 'weaponGear' }
        ]
        
        for (const mapping of slotMapping) {
          const inventoryItemId = equippedRow[mapping.column]
          
          if (inventoryItemId) {
            // Fetch inventory item to get descriptionId
            const { data: invItem } = await supabase
              .from(mapping.table)
              .select('descriptionId')
              .eq('id', inventoryItemId)
              .single()
            
            if (invItem && invItem.descriptionId) {
              // Fetch gear details to get HP
              const { data: gearData } = await supabase
                .from(mapping.gearTable)
                .select('hp')
                .eq('id', invItem.descriptionId)
                .single()
              
              if (gearData) {
                totalHPBonus += gearData.hp || 0
                console.log('Found item in', mapping.table, 'with HP:', gearData.hp)
              }
            }
          }
        }
        
        console.log('Total HP bonus to remove:', totalHPBonus)
        const newUserHP = Math.max(0, currentUserHP - totalHPBonus)
        console.log('Current HP:', currentUserHP, 'Subtracting:', totalHPBonus, 'New HP:', newUserHP)
        
        // Step 5: Set all equipment columns to NULL
        console.log('Step 5: Setting all equipment columns to NULL...')
        const { error: updateError } = await supabase
          .from('Equipped')
          .update({
            headEquipped: null,
            bodyEquipped: null,
            footEquipped: null,
            weaponEquipped: null
          })
          .eq('userId', userInfoId)
        
        if (updateError) {
          console.error('Error unequipping items:', updateError)
          alert('Failed to unequip items')
          return
        }
        
        console.log('✅ All items unequipped from Equipped table')
        
        // Step 6: Update user HP in database
        console.log('Step 6: Updating user HP in database...')
        const { error: hpUpdateError } = await supabase
          .from('userInfo')
          .update({ hp: newUserHP })
          .eq('id', userInfoId)
        
        if (hpUpdateError) {
          console.error('Error updating user HP:', hpUpdateError)
          alert('Items unequipped but failed to update HP')
        } else {
          console.log('✅ User HP updated to:', newUserHP)
          this.playerHp = newUserHP
        }
        
        // Update local state
        this.currentEquipped = {
          head: null,
          armor: null,
          foot: null,
          weapon: null
        }
        
        this.equippedDetails = {
          head: null,
          armor: null,
          foot: null,
          weapon: null
        }

        this.showNotification(`✅ All equipment unequipped!`, 'success')
      } catch (err) {
        console.error('Exception unequipping items:', err)
        alert('Error unequipping items')
      }
    },
    async unequipSlot(slot) {
      try {
        console.log('=== UNEQUIPPING SLOT:', slot, '===')
        
        // Determine which inventory table and column
        let inventoryTable = ''
        let inventoryColumn = ''
        let gearTable = ''
        
        if (slot === 'head') {
          inventoryTable = 'headinv'
          inventoryColumn = 'headEquipped'
          gearTable = 'headGear'
        } else if (slot === 'armor') {
          inventoryTable = 'bodyinv'
          inventoryColumn = 'bodyEquipped'
          gearTable = 'bodyGear'
        } else if (slot === 'foot') {
          inventoryTable = 'footinv'
          inventoryColumn = 'footEquipped'
          gearTable = 'footGear'
        } else if (slot === 'weapon') {
          inventoryTable = 'weaponinv'
          inventoryColumn = 'weaponEquipped'
          gearTable = 'weaponGear'
        }
        
        // Step 1: Get Credentials ID from username
        console.log('Step 1: Fetching Credentials ID...')
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching Credentials ID:', credError)
          alert('Failed to identify user')
          return
        }
        
        const credentialId = credData?.id
        console.log('✅ Credential ID found:', credentialId)
        
        // Step 2: Get userInfo ID (this is what Equipped.userId references)
        console.log('Step 2: Fetching userInfo ID and current HP...')
        const { data: userInfoData, error: userInfoError } = await supabase
          .from('userInfo')
          .select('id, hp')
          .eq('userId', credentialId)
          .single()
        
        if (userInfoError) {
          console.error('Error fetching userInfo:', userInfoError)
          alert('Failed to fetch user info')
          return
        }
        
        const userInfoId = userInfoData?.id
        const currentUserHP = userInfoData?.hp || 0
        console.log('✅ User Info ID found:', userInfoId, 'Current HP:', currentUserHP)
        
        // Step 3: Get the currently equipped item ID and get its HP value
        console.log('Step 3: Fetching currently equipped item details...')
        const { data: equippedRow, error: equippedError } = await supabase
          .from('Equipped')
          .select(inventoryColumn)
          .eq('userId', userInfoId)
          .single()
        
        if (equippedError || !equippedRow) {
          console.warn('No equipped items found')
          return
        }
        
        const inventoryItemId = equippedRow[inventoryColumn]
        console.log('Currently equipped inventory item ID:', inventoryItemId)
        
        if (!inventoryItemId) {
          console.log('No item equipped in this slot')
          return
        }
        
        // Step 4: Fetch the inventory item to get descriptionId
        console.log('Step 4: Fetching inventory item details...')
        const { data: invItem } = await supabase
          .from(inventoryTable)
          .select('descriptionId')
          .eq('id', inventoryItemId)
          .single()
        
        let itemHPBonus = 0
        if (invItem && invItem.descriptionId) {
          // Step 5: Fetch the gear details to get HP bonus
          console.log('Step 5: Fetching gear details to get HP bonus...')
          const { data: gearData } = await supabase
            .from(gearTable)
            .select('hp')
            .eq('id', invItem.descriptionId)
            .single()
          
          if (gearData) {
            itemHPBonus = gearData.hp || 0
            console.log('✅ Item HP bonus found:', itemHPBonus)
          }
        }
        
        const newUserHP = Math.max(0, currentUserHP - itemHPBonus) // Don't go below 0
        console.log('Current HP:', currentUserHP, 'Subtracting:', itemHPBonus, 'New HP:', newUserHP)
        
        // Step 6: Update the Equipped table to set this slot to NULL
        console.log('Step 6: Setting', inventoryColumn, 'to NULL in Equipped table...')
        const updateData = {}
        updateData[inventoryColumn] = null
        
        const { error: equipUpdateError } = await supabase
          .from('Equipped')
          .update(updateData)
          .eq('userId', userInfoId)
        
        if (equipUpdateError) {
          console.error('Error unequipping slot:', equipUpdateError)
          alert('Failed to unequip item')
          return
        }
        
        console.log('✅ Slot unequipped from Equipped table')
        
        // Step 7: Update user HP in database by subtracting the item bonus
        console.log('Step 7: Updating user HP in database...')
        const { error: hpUpdateError } = await supabase
          .from('userInfo')
          .update({ hp: newUserHP })
          .eq('id', userInfoId)
        
        if (hpUpdateError) {
          console.error('Error updating user HP:', hpUpdateError)
          alert('Item unequipped but failed to update HP')
        } else {
          console.log('✅ User HP updated to:', newUserHP)
          this.playerHp = newUserHP
        }
        
        // Update local state
        this.currentEquipped[slot] = null
        this.equippedDetails[slot] = null
        
        this.showNotification(`✅ ${slot.toUpperCase()} item unequipped!`, 'success')
      } catch (err) {
        console.error('Exception unequipping slot:', err)
        alert('Error unequipping item')
      }
    },
    async fetchUserInventory() {
      try {
        console.log('=== FETCHING USER INVENTORY ===')
        console.log('Username:', this.currentUsername)
        
        // Step 1: Get user ID from Credentials table
        console.log('Step 1: Fetching user ID from Credentials table...')
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching user ID:', credError)
          this.userInventory = []
          return
        }
        
        const userId = credData?.id
        console.log('✅ User ID found:', userId)
        
        // Step 2: Fetch from all 4 inventory tables using userId filter
        console.log('Step 2: Fetching inventory items with userId filter...')
        const [headResult, bodyResult, footResult, weaponResult] = await Promise.all([
          supabase.from('headinv').select('*').eq('userId', userId),
          supabase.from('bodyinv').select('*').eq('userId', userId),
          supabase.from('footinv').select('*').eq('userId', userId),
          supabase.from('weaponinv').select('*').eq('userId', userId)
        ])
        
        console.log('=== USER INVENTORY FETCH RESULTS ===')
        console.log('Head Inventory Result:', { data: headResult.data, error: headResult.error })
        console.log('Body Inventory Result:', { data: bodyResult.data, error: bodyResult.error })
        console.log('Foot Inventory Result:', { data: footResult.data, error: footResult.error })
        console.log('Weapon Inventory Result:', { data: weaponResult.data, error: weaponResult.error })

        // Build inventory list from all tables
        this.userInventory = []
        
        // Add head items
        if (headResult.error) {
          console.warn('Head inventory error:', headResult.error.message)
        } else if (headResult.data && Array.isArray(headResult.data)) {
          console.log('Head items count (total):', headResult.data.length)
          console.log('All head items:', headResult.data)
          for (const row of headResult.data) {
            if (row['head!Equipped']) {
              console.log('✅ Adding head item:', row['head!Equipped'])
              
              // Fetch description from headGear table using foreign key
              let description = 'Head protection'
              if (row.descriptionId) {
                const { data: gearData } = await supabase
                  .from('headGear')
                  .select('description')
                  .eq('id', row.descriptionId)
                  .single()
                if (gearData && gearData.description) {
                  description = gearData.description
                }
              }
              
              this.userInventory.push({
                id: row.id,
                name: row['head!Equipped'],
                type: 'HEAD GEAR',
                icon: '⚙️',
                image: row.image,
                description: description,
                table: 'headinv',
                column: 'head!Equipped',
                descriptionId: row.descriptionId
              })
            }
          }
        }
        
        // Add body items
        if (bodyResult.error) {
          console.warn('Body inventory error:', bodyResult.error.message)
        } else if (bodyResult.data && Array.isArray(bodyResult.data)) {
          console.log('Body items count (total):', bodyResult.data.length)
          for (const row of bodyResult.data) {
            if (row['body!Equipped']) {
              console.log('✅ Adding body item:', row['body!Equipped'])
              
              // Fetch description from bodyGear table using foreign key
              let description = 'Body armor'
              if (row.descriptionId) {
                const { data: gearData } = await supabase
                  .from('bodyGear')
                  .select('description')
                  .eq('id', row.descriptionId)
                  .single()
                if (gearData && gearData.description) {
                  description = gearData.description
                }
              }
              
              this.userInventory.push({
                id: row.id,
                name: row['body!Equipped'],
                type: 'BODY GEAR',
                icon: '🛡️',
                image: row.image,
                description: description,
                table: 'bodyinv',
                column: 'body!Equipped',
                descriptionId: row.descriptionId
              })
            }
          }
        }
        
        // Add foot items
        if (footResult.error) {
          console.warn('Foot inventory error:', footResult.error.message)
        } else if (footResult.data && Array.isArray(footResult.data)) {
          console.log('Foot items count (total):', footResult.data.length)
          for (const row of footResult.data) {
            if (row['foot!Equipped']) {
              console.log('✅ Adding foot item:', row['foot!Equipped'])
              
              // Fetch description from footGear table using foreign key
              let description = 'Foot protection'
              if (row.descriptionId) {
                const { data: gearData } = await supabase
                  .from('footGear')
                  .select('description')
                  .eq('id', row.descriptionId)
                  .single()
                if (gearData && gearData.description) {
                  description = gearData.description
                }
              }
              
              this.userInventory.push({
                id: row.id,
                name: row['foot!Equipped'],
                type: 'FOOT GEAR',
                icon: '👢',
                image: row.image,
                description: description,
                table: 'footinv',
                column: 'foot!Equipped',
                descriptionId: row.descriptionId
              })
            }
          }
        }
        
        // Add weapon items
        if (weaponResult.error) {
          console.warn('Weapon inventory error:', weaponResult.error.message)
        } else if (weaponResult.data && Array.isArray(weaponResult.data)) {
          console.log('Weapon items count (total):', weaponResult.data.length)
          for (const row of weaponResult.data) {
            if (row['weapon!Equipped']) {
              console.log('✅ Adding weapon item:', row['weapon!Equipped'])
              
              // Fetch description from weaponGear table using foreign key
              let description = 'Weapon'
              if (row.descriptionId) {
                const { data: gearData } = await supabase
                  .from('weaponGear')
                  .select('description')
                  .eq('id', row.descriptionId)
                  .single()
                if (gearData && gearData.description) {
                  description = gearData.description
                }
              }
              
              this.userInventory.push({
                id: row.id,
                name: row['weapon!Equipped'],
                type: 'WEAPON GEAR',
                icon: '⚔️',
                image: row.image,
                description: description,
                table: 'weaponinv',
                column: 'weapon!Equipped',
                descriptionId: row.descriptionId
              })
            }
          }
        }
        
        console.log('Total inventory items:', this.userInventory.length)
      } catch (err) {
        console.error('Exception fetching inventory:', err)
        console.error('Error stack:', err.stack)
      }
    },
    async fetchEquippedItems() {
      try {
        console.log('=== FETCHING EQUIPPED ITEMS ===')
        console.log('Username:', this.currentUsername)
        
        // Step 1: Get Credentials ID from username
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching Credentials ID:', credError)
          return
        }
        
        const credentialId = credData?.id
        console.log('✅ Credential ID found:', credentialId)
        
        // Step 2: Get userInfo ID (this is what Equipped.userId references)
        console.log('Step 2: Fetching userInfo ID...')
        const { data: userInfoData, error: userInfoError } = await supabase
          .from('userInfo')
          .select('id')
          .eq('userId', credentialId)
          .single()
        
        if (userInfoError) {
          console.error('Error fetching userInfo:', userInfoError)
          return
        }
        
        const userInfoId = userInfoData?.id
        console.log('✅ User Info ID found:', userInfoId)
        
        // Step 3: Fetch equipped items row from Equipped table using userInfoId
        console.log('Step 3: Fetching equipped items from Equipped table...')
        const { data: equippedRow, error: equippedError } = await supabase
          .from('Equipped')
          .select('*')
          .eq('userId', userInfoId)
          .single()
        
        if (equippedError) {
          console.warn('No equipped items found or error:', equippedError.message)
          // This is normal if user hasn't equipped anything yet
          return
        }
        
        if (!equippedRow) {
          console.log('✅ User has no equipped items yet')
          return
        }
        
        console.log('✅ Equipped row found:', equippedRow)
        
        // Store the IDs
        this.currentEquipped = {
          head: equippedRow.headEquipped || null,
          armor: equippedRow.bodyEquipped || null,
          foot: equippedRow.footEquipped || null,
          weapon: equippedRow.weaponEquipped || null
        }
        
        console.log('Current equipped IDs:', this.currentEquipped)
        
        // Step 4: Fetch full details for each equipped item
        await this.fetchEquippedItemDetails()
      } catch (err) {
        console.error('Exception fetching equipped items:', err)
      }
    },
    
    async fetchEquippedItemDetails() {
      try {
        console.log('=== FETCHING EQUIPPED ITEM DETAILS ===')
        
        // Reset details
        this.equippedDetails = {
          head: null,
          armor: null,
          foot: null,
          weapon: null
        }
        
        // Fetch head gear details
        if (this.currentEquipped.head) {
          console.log('Fetching head gear details for ID:', this.currentEquipped.head)
          const { data: headItem } = await supabase
            .from('headinv')
            .select('*')
            .eq('id', this.currentEquipped.head)
            .single()
          
          if (headItem && headItem.descriptionId) {
            const { data: headGear } = await supabase
              .from('headGear')
              .select('*')
              .eq('id', headItem.descriptionId)
              .single()
            
            if (headGear) {
              this.equippedDetails.head = {
                id: this.currentEquipped.head,
                name: headGear.head,
                image: headItem.image,
                hp: headGear.bonus || headGear.hp || 0,
                description: headGear.description
              }
              console.log('✅ Head gear details loaded:', this.equippedDetails.head)
            }
          }
        }
        
        // Fetch body gear details
        if (this.currentEquipped.armor) {
          console.log('Fetching body gear details for ID:', this.currentEquipped.armor)
          const { data: bodyItem } = await supabase
            .from('bodyinv')
            .select('*')
            .eq('id', this.currentEquipped.armor)
            .single()
          
          if (bodyItem && bodyItem.descriptionId) {
            const { data: bodyGear } = await supabase
              .from('bodyGear')
              .select('*')
              .eq('id', bodyItem.descriptionId)
              .single()
            
            if (bodyGear) {
              this.equippedDetails.armor = {
                id: this.currentEquipped.armor,
                name: bodyGear.body,
                image: bodyItem.image,
                hp: bodyGear.bonus || bodyGear.hp || 0,
                description: bodyGear.description
              }
              console.log('✅ Body gear details loaded:', this.equippedDetails.armor)
            }
          }
        }
        
        // Fetch foot gear details
        if (this.currentEquipped.foot) {
          console.log('Fetching foot gear details for ID:', this.currentEquipped.foot)
          const { data: footItem } = await supabase
            .from('footinv')
            .select('*')
            .eq('id', this.currentEquipped.foot)
            .single()
          
          if (footItem && footItem.descriptionId) {
            const { data: footGear } = await supabase
              .from('footGear')
              .select('*')
              .eq('id', footItem.descriptionId)
              .single()
            
            if (footGear) {
              this.equippedDetails.foot = {
                id: this.currentEquipped.foot,
                name: footGear.foot,
                image: footItem.image,
                hp: footGear.bonus || footGear.hp || 0,
                description: footGear.description
              }
              console.log('✅ Foot gear details loaded:', this.equippedDetails.foot)
            }
          }
        }
        
        // Fetch weapon details
        if (this.currentEquipped.weapon) {
          console.log('Fetching weapon details for ID:', this.currentEquipped.weapon)
          const { data: weaponItem } = await supabase
            .from('weaponinv')
            .select('*')
            .eq('id', this.currentEquipped.weapon)
            .single()
          
          if (weaponItem && weaponItem.descriptionId) {
            const { data: weaponGear } = await supabase
              .from('weaponGear')
              .select('*')
              .eq('id', weaponItem.descriptionId)
              .single()
            
            if (weaponGear) {
              this.equippedDetails.weapon = {
                id: this.currentEquipped.weapon,
                name: weaponGear.weapon,
                image: weaponItem.image,
                hp: weaponGear.bonus || weaponGear.hp || 0,
                description: weaponGear.description
              }
              console.log('✅ Weapon details loaded:', this.equippedDetails.weapon)
            }
          }
        }
        
        console.log('✅ All equipped item details loaded:', this.equippedDetails)
      } catch (err) {
        console.error('Exception fetching equipped item details:', err)
      }
    },
    async fetchPlayerStats() {
      try {
        // Prevent simultaneous fetches
        if (this.isFetchingStats) {
          console.warn('⚠️ Stats fetch already in progress, skipping')
          return
        }
        
        this.isFetchingStats = true
        console.log('=== FETCHING PLAYER STATS ===')
        console.log('Username:', this.currentUsername)
        
        // Step 1: Get user ID from Credentials table
        console.log('Step 1: Fetching user ID from Credentials table...')
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching user ID:', credError)
          this.isFetchingStats = false
          return
        }
        
        const userId = credData?.id
        console.log('✅ User ID found:', userId)
        
        // Step 2: Fetch stats from userInfo table
        console.log('Step 2: Fetching stats from userInfo table...')
        const { data: userInfo, error: userInfoError } = await supabase
          .from('userInfo')
          .select('level, xp, gold, hp, id')
          .eq('userId', userId)
          .single()
        
        if (userInfoError) {
          console.error('Error fetching user stats:', userInfoError)
          this.isFetchingStats = false
          return
        }
        
        if (userInfo) {
          // Store the userInfo ID for real-time subscriptions
          this.userInfoId = userInfo.id
          
          // Handle NULL level - default to 1
          this.playerLevel = (userInfo.level === null || userInfo.level === undefined) ? 1 : userInfo.level
          this.playerExp = userInfo.xp || 0
          this.playerGold = userInfo.gold || 0
          
          // HP column contains the total effective HP (base + equipment bonuses)
          this.playerHp = userInfo.hp || 100
          
          console.log('✅ Player stats loaded:', {
            id: this.userInfoId,
            level: this.playerLevel,
            xp: this.playerExp,
            gold: this.playerGold,
            hp: this.playerHp
          })
        } else {
          console.warn('⚠️ No player stats found')
        }
      } catch (err) {
        console.error('Exception fetching player stats:', err)
      } finally {
        this.isFetchingStats = false
      }
    },
    async subscribeToPlayerStatsChanges() {
      try {
        if (!this.userInfoId) {
          console.warn('⚠️ User info ID not available for subscription')
          return
        }
        
        console.log('🔴 Setting up real-time subscription for userInfo ID:', this.userInfoId)
        
        // Subscribe to real-time changes on the userInfo table using modern Supabase API
        this.statsSubscription = supabase
          .channel('player-stats-' + this.userInfoId)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'userInfo',
              filter: 'id=eq.' + this.userInfoId
            },
            (payload) => {
              console.log('📡 Real-time update received:', payload)
              console.log('🔄 Updating player stats in real-time')
              
              // Update local state immediately with new data
              const newData = payload.new
              this.playerLevel = (newData.level === null || newData.level === undefined) ? 1 : newData.level
              this.playerExp = newData.xp || 0
              this.playerGold = newData.gold || 0
              this.playerHp = newData.hp || 100
              
              console.log('✅ Player stats updated in real-time:', {
                level: this.playerLevel,
                xp: this.playerExp,
                gold: this.playerGold,
                hp: this.playerHp
              })
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Real-time subscription active for player stats')
            } else if (status === 'CLOSED') {
              console.log('⚠️ Real-time subscription closed')
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Channel error, attempting to resubscribe')
              setTimeout(() => this.subscribeToPlayerStatsChanges(), 2000)
            }
          })
      } catch (err) {
        console.error('❌ Exception setting up real-time subscription:', err)
      }
    },
    async fetchPlayerGold() {
      try {
        console.log('=== FETCHING PLAYER GOLD ===')
        console.log('Username:', this.currentUsername)
        
        // Step 1: Get user ID from Credentials table
        console.log('Step 1: Fetching user ID from Credentials table...')
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching user ID:', credError)
          this.playerGold = 0
          return
        }
        
        const userId = credData?.id
        console.log('✅ User ID found:', userId)
        
        // Step 2: Fetch gold from userInfo table
        console.log('Step 2: Fetching gold from userInfo table...')
        const { data: userInfo, error: userInfoError } = await supabase
          .from('userInfo')
          .select('gold')
          .eq('userId', userId)
          .single()
        
        if (userInfoError) {
          console.error('Error fetching user gold:', userInfoError)
          this.playerGold = 0
          return
        }
        
        if (userInfo && typeof userInfo.gold === 'number') {
          this.playerGold = userInfo.gold
          console.log('✅ Player gold loaded:', this.playerGold)
        } else {
          console.warn('⚠️ No gold data found, defaulting to 0')
          this.playerGold = 0
        }
      } catch (err) {
        console.error('Exception fetching player gold:', err)
        this.playerGold = 0
      }
    },
    async equipItem(slot, itemName) {
      try {
        // Get user ID from Credentials table
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching user ID:', credError)
          alert('Failed to identify user')
          return
        }
        
        const userId = credData?.id
        
        let table = ''
        let column = ''
        
        if (slot === 'head') {
          table = 'headinv'
          column = 'head!Equipped'
        } else if (slot === 'armor') {
          table = 'bodyinv'
          column = 'body!Equipped'
        } else if (slot === 'foot') {
          table = 'footinv'
          column = 'foot!Equipped'
        } else if (slot === 'weapon') {
          table = 'weaponinv'
          column = 'weapon!Equipped'
        }

        const updateData = {}
        updateData[column] = itemName

        const { error } = await supabase
          .from(table)
          .update(updateData)
          .eq('userid', userId)
        
        if (error) {
          console.error('Error equipping item:', error)
          alert('Failed to equip item')
        } else {
          this.currentEquipped[slot] = itemName
          alert(`${itemName} equipped!`)
        }
      } catch (err) {
        console.error('Exception equipping item:', err)
        alert('Error equipping item')
      }
    },
    async unequipItem(slot) {
      try {
        // Get user ID from Credentials table
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (credError) {
          console.error('Error fetching user ID:', credError)
          alert('Failed to identify user')
          return
        }
        
        const userId = credData?.id
        
        let table = ''
        let column = ''
        
        if (slot === 'head') {
          table = 'headinv'
          column = 'head!Equipped'
        } else if (slot === 'armor') {
          table = 'bodyinv'
          column = 'body!Equipped'
        } else if (slot === 'foot') {
          table = 'footinv'
          column = 'foot!Equipped'
        } else if (slot === 'weapon') {
          table = 'weaponinv'
          column = 'weapon!Equipped'
        }

        const updateData = {}
        updateData[column] = null

        const { error } = await supabase
          .from(table)
          .update(updateData)
          .eq('userid', userId)
        
        if (error) {
          console.error('Error unequipping item:', error)
          alert('Failed to unequip item')
        } else {
          this.currentEquipped[slot] = ''
          alert('Item unequipped!')
        }
      } catch (err) {
        console.error('Exception unequipping item:', err)
        alert('Error unequipping item')
      }
    },
    async selectItemToSell(index) {
      console.log('=== SELECT ITEM TO SELL ===')
      console.log('Selected index:', index)
      
      const item = this.userInventory[index]
      console.log('Selected item:', { table: item.table, id: item.id, name: item.name, type: item.type })
      
      // Check if item is currently equipped (need to pass both table and id for unique identification)
      const isEquipped = await this.isInventoryItemEquipped(item.table, item.id)
      console.log('Is equipped:', isEquipped)
      
      if (isEquipped) {
        alert('❌ You cannot sell an item that is currently equipped!\nUnequip it first.')
        return
      }
      
      console.log('Setting sellForm.selectedItemIndex to:', index)
      this.sellForm.selectedItemIndex = index
      this.sellForm.name = item.name
      this.sellForm.icon = item.icon
      this.sellForm.description = item.description
      this.sellForm.type = this.getTypeColumn(item.type)
      this.sellForm.descriptionId = item.descriptionId
      this.sellForm.price = 0 // Reset price each time
      
      console.log('Sell form state:', this.sellForm)
    },
    getTypeColumn(type) {
      if (type === 'HEAD GEAR') return 'headGear'
      if (type === 'BODY GEAR') return 'bodyGear'
      if (type === 'FOOT GEAR') return 'footGear'
      if (type === 'WEAPON') return 'weapon'
      return ''
    },
    async isInventoryItemEquipped(inventoryTable, inventoryItemId) {
      try {
        // Step 1: Get Credentials ID from username
        const { data: credData } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (!credData) {
          console.log('❌ No credential data found')
          return false
        }
        
        const credentialId = credData.id
        
        // Step 2: Get userInfo ID (this is what Equipped.userId references)
        const { data: userInfoData } = await supabase
          .from('userInfo')
          .select('id')
          .eq('userId', credentialId)
          .single()
        
        if (!userInfoData) {
          console.log('❌ No userInfo found')
          return false
        }
        
        const userInfoId = userInfoData.id
        
        // Step 3: Check if this inventory item is in any of the equipped slots
        // We need to match by BOTH table AND id since each table has its own ID sequence
        const { data: equippedRow } = await supabase
          .from('Equipped')
          .select('headEquipped, bodyEquipped, footEquipped, weaponEquipped')
          .eq('userId', userInfoId)
          .single()
        
        if (!equippedRow) {
          console.log('❌ No equipped row found')
          return false
        }
        
        console.log('📊 Checking if item equipped:')
        console.log('  Looking for - Table:', inventoryTable, 'ID:', inventoryItemId)
        console.log('  Equipped data:', equippedRow)
        
        // Check if the item matches any equipped slot by ID only
        // The equipped slot contains the ID of the item from the inventory table
        if (inventoryTable === 'headinv' && equippedRow.headEquipped === inventoryItemId) {
          console.log('  ✅ Item is equipped as HEAD')
          return true
        }
        if (inventoryTable === 'bodyinv' && equippedRow.bodyEquipped === inventoryItemId) {
          console.log('  ✅ Item is equipped as BODY')
          return true
        }
        if (inventoryTable === 'footinv' && equippedRow.footEquipped === inventoryItemId) {
          console.log('  ✅ Item is equipped as FOOT')
          return true
        }
        if (inventoryTable === 'weaponinv' && equippedRow.weaponEquipped === inventoryItemId) {
          console.log('  ✅ Item is equipped as WEAPON')
          return true
        }
        
        console.log('  ❌ Item is not equipped')
        return false
      } catch (err) {
        console.error('Error checking if item is equipped:', err)
        return false
      }
    },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.capital-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Press Start 2P', cursive;
  background: #000;
}

/* Video Overlay */
.video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: fadeOut 1s ease-in-out 7.5s forwards;
}

.capital-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.skip-text {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffcc00;
  font-size: 10px;
  text-shadow: 2px 2px #000;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    z-index: 300;
  }
  100% {
    opacity: 0;
    z-index: -1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes fadeOutPage {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes fadeOutVideo {
  0% {
    opacity: 1;
    z-index: 300;
  }
  100% {
    opacity: 0;
    z-index: -1;
  }
}

.capital-container.fade-out-page {
  animation: fadeOutPage 0.5s ease-in-out forwards;
}

.video-overlay.fade-out {
  animation: fadeOutVideo 1s ease-in-out 7.5s forwards;
}

/* Main Content */
.capital-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/Gemini_Generated_Image_lpiz46lpiz46lpiz.png') center/cover;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.capital-content.fade-in {
  opacity: 1;
}

/* Back Button */
.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 50;
  
  padding: 10px 15px;
  border-radius: 8px;
  
  background-color: rgba(59, 45, 38, 0.9);
  border: 3px solid #eebb4d;
  color: #ffcc00;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  text-shadow: 2px 2px #000;
}

.back-button:hover {
  transform: scale(1.05);
  background-color: rgba(59, 45, 38, 1);
  box-shadow: 0 6px 12px rgba(0,0,0,0.7);
}

.back-button:active {
  transform: scale(0.95);
}

/* Audio Toggle Button */
.audio-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 50;
  
  padding: 10px 15px;
  border-radius: 8px;
  
  background-color: rgba(59, 45, 38, 0.9);
  border: 3px solid #eebb4d;
  color: #ffcc00;
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  text-shadow: 2px 2px #000;
}

.audio-toggle:hover {
  transform: scale(1.05);
  background-color: rgba(59, 45, 38, 1);
  box-shadow: 0 6px 12px rgba(0,0,0,0.7);
}

.audio-toggle:active {
  transform: scale(0.95);
}

/* Title Overlay */
.title-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 50;
}

.title-overlay h1 {
  font-size: 24px;
  color: #ffcc00;
  text-shadow: 
    3px 3px 0px #8b5a00,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000;
  margin-bottom: 8px;
}

.title-overlay p {
  font-size: 10px;
  color: #4dcfff;
  text-shadow: 2px 2px #000;
}

/* Player Stats */
.player-stats {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 40;
  
  background: rgba(59, 45, 38, 0.95);
  border: 3px solid #eebb4d;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  gap: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #ffcc00;
  font-size: 8px;
  font-weight: bold;
  text-shadow: 1px 1px #000;
}

.stat-value {
  color: #a0a0b0;
  font-size: 10px;
  text-shadow: 1px 1px #000;
}

/* Interactive Buttons Overlay */
.buttons-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.location-button {
  position: absolute;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;
  pointer-events: auto;
}

.button-box {
  padding: 6px 10px;
  background: linear-gradient(145deg, #FFD700, #FFA500);
  border: 3px solid #000;
  box-shadow: 
    inset -2px -2px #654321,
    inset 2px 2px #FFFFFF,
    3px 3px 0px #000,
    5px 5px 0px rgba(0, 0, 0, 0.3);
  font-family: 'Press Start 2P', cursive;
  font-size: 8px;
  font-weight: bold;
  color: #000;
  white-space: nowrap;
  text-align: center;
  animation: pixel-pulse 1.5s ease-in-out infinite;
  line-height: 1.2;
}

@keyframes pixel-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.location-button:hover .button-box {
  animation: none;
  background: linear-gradient(145deg, #FFED4E, #FFD700);
  box-shadow: 
    inset -2px -2px #654321,
    inset 2px 2px #FFFFFF,
    0px 0px 0px 3px #FFD700,
    3px 3px 0px #000,
    5px 5px 0px rgba(0, 0, 0, 0.3);
  transform: scale(1.15) translateY(-5px);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  background: rgba(59, 45, 38, 0.95);
  border: 4px solid #eebb4d;
  border-radius: 10px;
  padding: 30px;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  position: relative;
  animation: slideUp 0.4s ease-out;
}

/* Wide Market Modal */
.market-modal-content {
  background: rgba(59, 45, 38, 0.95);
  border: 4px solid #eebb4d;
  border-radius: 10px;
  padding: 30px;
  max-width: 1000px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  position: relative;
}

/* Equipment Modal with Fixed Size */
.equipment-modal-content {
  width: 850px;
  height: 900px;
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.equipment-modal-content > h2 {
  flex-shrink: 0;
  margin-bottom: 15px;
}

.equipment-modal-content > div {
  flex-shrink: 0;
}

.equipment-modal-content .inventory-section {
  flex: 1;
  overflow-y: auto;
  min-height: 300px;
}

.equipment-modal-content .unequip-all-section {
  flex-shrink: 0;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: rgba(238, 187, 77, 0.8);
  border: 2px solid #fff;
  border-radius: 50%;
  color: #000;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.close-modal:hover {
  background: rgba(255, 204, 0, 1);
  transform: rotate(90deg);
}

.modal-content h2 {
  color: #ffcc00;
  font-size: 16px;
  margin-bottom: 20px;
  text-transform: uppercase;
  text-shadow: 2px 2px #000;
}

.modal-content h3 {
  color: #ffcc00;
  font-size: 12px;
  margin-top: 15px;
  margin-bottom: 8px;
  text-shadow: 1px 1px #000;
}

.modal-content p {
  color: #a0a0b0;
  font-size: 8px;
  margin-bottom: 10px;
  line-height: 1.4;
}

.modal-content ul {
  color: #a0a0b0;
  font-size: 8px;
  margin-left: 20px;
  margin-bottom: 10px;
}

.modal-content li {
  margin-bottom: 6px;
  line-height: 1.3;
}

.tutorial-section {
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #eebb4d;
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.item-card {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #eebb4d;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(238, 187, 77, 0.3);
}

.item-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.item-card h4 {
  color: #ffcc00;
  font-size: 10px;
  margin-bottom: 6px;
  text-shadow: 1px 1px #000;
}

.item-description {
  color: #a0a0b0;
  font-size: 7px;
  margin-bottom: 6px;
  line-height: 1.2;
}

.item-stats {
  color: #4dcfff;
  font-size: 8px;
  margin-bottom: 4px;
  text-shadow: 1px 1px #000;
}

.item-price {
  color: #ffcc00;
  font-size: 9px;
  margin-bottom: 8px;
  font-weight: bold;
}

.buy-button {
  width: 100%;
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border: 2px solid #eebb4d;
  padding: 6px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.buy-button:hover:not(:disabled) {
  background: rgba(138, 148, 176, 1);
  transform: scale(1.05);
}

.buy-button:disabled {
  background: rgba(100, 100, 100, 0.5);
  cursor: not-allowed;
  color: #666;
}

.cancel-button {
  width: 100%;
  background: rgba(200, 100, 100, 0.9);
  color: #fff;
  border: 2px solid #ff6b6b;
  padding: 6px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(220, 120, 120, 1);
  transform: scale(1.05);
}

.tutorial-button {
  width: 100%;
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border: 2px solid #eebb4d;
  padding: 10px;
  font-size: 10px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  text-transform: uppercase;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.tutorial-button:hover {
  background: rgba(138, 148, 176, 1);
  transform: scale(1.05);
}

/* Start Quest Button */
.start-quest-button {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  
  padding: 12px 20px;
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border: 2px solid #eebb4d;
  font-size: 12px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  text-shadow: 2px 2px #000;
}

.start-quest-button:hover {
  background: rgba(138, 148, 176, 1);
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 6px 12px rgba(0,0,0,0.7);
}

.start-quest-button:active {
  transform: translateX(-50%) scale(0.95);
}

/* Market Tabs */
.market-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eebb4d;
  padding-bottom: 10px;
}

.tab-button {
  background: rgba(100, 100, 100, 0.5);
  color: #a0a0b0;
  border: 2px solid #666;
  padding: 8px 16px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.tab-button:hover {
  background: rgba(120, 120, 120, 0.7);
  color: #ffcc00;
}

.tab-button.active {
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border: 2px solid #eebb4d;
}

/* Tab Content */
.tab-content {
  min-height: 300px;
}

.tab-content h3 {
  color: #ffcc00;
  font-size: 12px;
  margin-bottom: 15px;
  text-shadow: 1px 1px #000;
}

/* Items Grid Wide (for market) */
.items-grid-wide {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.item-card-wide {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #eebb4d;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.item-card-wide:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 16px rgba(238, 187, 77, 0.3);
}

.item-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 80px;
  background: rgba(59, 45, 38, 0.8);
  border: 2px solid #eebb4d;
  border-radius: 6px;
  overflow: hidden;
}

.item-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-icon-large {
  font-size: 48px;
  line-height: 1;
}

.item-card-wide .item-icon {
  font-size: 28px;
  min-width: 40px;
  text-align: center;
}

.item-card-wide .item-info {
  flex: 1;
}

.item-card-wide h4 {
  color: #ffcc00;
  font-size: 10px;
  margin-bottom: 4px;
  text-shadow: 1px 1px #000;
}

.item-card-wide .item-description {
  color: #a0a0b0;
  font-size: 7px;
  margin-bottom: 4px;
}

.item-card-wide .item-stats {
  color: #4dcfff;
  font-size: 8px;
  margin-bottom: 2px;
  text-shadow: 1px 1px #000;
}

.item-card-wide .item-stock {
  color: #eebb4d;
  font-size: 7px;
  margin-top: 4px;
  text-shadow: 1px 1px #000;
}

.item-card-wide .item-seller {
  color: #ffa500;
  font-size: 7px;
  margin-top: 4px;
}

.item-card-wide .item-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.item-card-wide .item-price {
  color: #ffcc00;
  font-size: 9px;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}

/* Sell Form */
.sell-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #eebb4d;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #ffcc00;
  font-size: 8px;
  font-weight: bold;
  text-shadow: 1px 1px #000;
}

.form-group input,
.form-group select {
  background: rgba(59, 45, 38, 0.9);
  color: #a0a0b0;
  border: 2px solid #eebb4d;
  padding: 8px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  border-radius: 4px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  background: rgba(80, 65, 55, 1);
  color: #ffcc00;
  box-shadow: 0 0 8px rgba(238, 187, 77, 0.5);
}

.form-group input::placeholder {
  color: #666;
}

.sell-button {
  grid-column: 1 / -1;
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border: 2px solid #eebb4d;
  padding: 12px;
  font-size: 10px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.sell-button:hover {
  background: rgba(138, 148, 176, 1);
  transform: scale(1.05);
}

/* Inventory List */
.inventory-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.inventory-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #eebb4d;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.inventory-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(238, 187, 77, 0.3);
}

.inventory-item .item-icon {
  font-size: 32px;
}

.inventory-item h4 {
  color: #ffcc00;
  font-size: 9px;
  text-shadow: 1px 1px #000;
  margin-bottom: 4px;
}

.inventory-item .item-stats {
  color: #4dcfff;
  font-size: 8px;
  text-shadow: 1px 1px #000;
}

.inventory-item .item-type-small {
  color: #aaa;
  font-size: 7px;
  margin: 2px 0;
  text-transform: uppercase;
}

.inventory-item .item-description-small {
  color: #ccc;
  font-size: 7px;
  margin: 4px 0;
  line-height: 1.1;
  max-height: 30px;
  overflow: hidden;
}

/* Empty Message */
.empty-message {
  text-align: center;
  padding: 40px;
  color: #a0a0b0;
  font-size: 10px;
}

/* Equipment Grid */
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.equipment-slot {
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid #eebb4d;
  border-radius: 8px;
  padding: 15px;
}

.equipment-slot h3 {
  color: #ffcc00;
  font-size: 12px;
  margin-bottom: 12px;
  text-shadow: 1px 1px #000;
  text-align: center;
}

.current-equipment {
  background: rgba(59, 45, 38, 0.9);
  border: 2px solid #eebb4d;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-equipment p {
  color: #ffcc00;
  font-size: 9px;
  text-shadow: 1px 1px #000;
  text-align: center;
  margin: 0;
}

.current-equipment .empty-slot {
  color: #888;
  font-size: 8px;
}

.available-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.equipment-select-button {
  background: rgba(123, 133, 161, 0.8);
  color: #fff;
  border: 2px solid #eebb4d;
  padding: 8px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.equipment-select-button:hover {
  background: rgba(138, 148, 176, 1);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(238, 187, 77, 0.3);
}

.equipment-select-button:active {
  transform: scale(0.95);
}

.unequip-button {
  background: rgba(180, 100, 100, 0.8);
  color: #fff;
  border: 2px solid #ff6b6b;
  padding: 8px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 6px;
}

.unequip-button:hover {
  background: rgba(200, 120, 120, 1);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.unequip-button:active {
  transform: scale(0.95);
}

/* Sell Section Styles */
.sell-section {
  margin-bottom: 25px;
}

.sell-section h4 {
  color: #ffcc00;
  font-size: 10px;
  margin-bottom: 12px;
  text-shadow: 1px 1px #000;
  padding-bottom: 8px;
  border-bottom: 2px solid #eebb4d;
}

/* Inventory Selection Grid */
.inventory-select-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.inventory-select-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #666;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.inventory-select-card:hover {
  border-color: #eebb4d;
  background: rgba(0, 0, 0, 0.6);
  transform: translateY(-3px);
}

.inventory-select-card.selected {
  border: 3px solid #ffcc00;
  background: rgba(238, 187, 77, 0.15);
  box-shadow: 0 0 10px rgba(238, 187, 77, 0.5), inset 0 0 10px rgba(238, 187, 77, 0.1);
}

.inventory-select-card .item-icon {
  font-size: 28px;
}

.item-image-container-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(59, 45, 38, 0.8);
  border: 2px solid #eebb4d;
  border-radius: 6px;
  overflow: hidden;
}

.item-image-container-small .item-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.inventory-select-card h5 {
  color: #ffcc00;
  font-size: 8px;
  text-shadow: 1px 1px #000;
  text-align: center;
  margin: 0;
}

.inventory-select-card .item-type {
  color: #4dcfff;
  font-size: 7px;
  margin: 0;
}

/* Price Form */
.price-form {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #eebb4d;
  border-radius: 8px;
  padding: 15px;
}

.price-form .form-group {
  margin-bottom: 12px;
}

.price-form .form-group:last-child {
  margin-bottom: 0;
}

.price-form input:disabled {
  background: rgba(59, 45, 38, 0.6) !important;
  color: #888 !important;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .player-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .modal-content,
  .market-modal-content {
    padding: 20px;
    max-width: 95vw;
  }

  .sell-form {
    grid-template-columns: 1fr;
  }

  .inventory-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

/* Equipment Category Filter */
.equipment-category-filter {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
}

/* Inventory Category Filter */
.inventory-category-filter {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 15px;
}

/* Sell Category Filter */
.sell-category-filter {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 15px;
}

.category-button {
  background: rgba(100, 100, 130, 0.8);
  color: #fff;
  border: 2px solid #666;
  padding: 8px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.category-button:hover {
  background: rgba(120, 120, 150, 1);
  border-color: #ffcc00;
}

.category-button.active {
  background: rgba(200, 150, 50, 0.9);
  border-color: #ffcc00;
  box-shadow: 0 0 10px #ffcc00;
}

/* Equipped Section */
.equipped-section {
  background: rgba(50, 50, 80, 0.9);
  border: 2px solid #666;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.equipped-section h3 {
  color: #ffcc00;
  margin-bottom: 10px;
  font-size: 12px;
}

.equipped-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.equipped-item {
  background: rgba(30, 30, 60, 0.9);
  border: 1px solid #444;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.equipped-item .slot-label {
  color: #aaa;
  font-size: 8px;
  margin-bottom: 5px;
}

.equipped-item .equipped-name {
  color: #ffcc00;
  font-size: 9px;
  font-weight: bold;
  margin-bottom: 8px;
}

.equip-slot-button {
  width: 100%;
  background: rgba(100, 100, 150, 0.9);
  color: #fff;
  border: 2px solid #6f6f9f;
  padding: 6px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.equip-slot-button:hover {
  background: rgba(120, 120, 180, 1);
  border-color: #ffcc00;
}

/* Inventory Section */
.inventory-section {
  background: rgba(50, 50, 80, 0.9);
  border: 2px solid #666;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 300px;
  max-height: 600px;
}

.inventory-section h3 {
  color: #ffcc00;
  margin-bottom: 15px;
  font-size: 12px;
  flex-shrink: 0;
}

.equipment-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.equipment-item-card {
  background: rgba(30, 30, 60, 0.9);
  border: 2px solid #555;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.equipment-item-card:hover {
  background: rgba(50, 50, 80, 1);
  border-color: #ffcc00;
  transform: translateY(-2px);
}

.equipment-item-card .item-header {
  margin-bottom: 8px;
}

.equipment-item-card h4 {
  color: #fff;
  font-size: 9px;
  margin: 0;
  margin-bottom: 3px;
}

.equipment-item-card .item-type {
  color: #aaa;
  font-size: 7px;
  margin: 0;
}

.equipment-item-card .item-description {
  color: #ccc;
  font-size: 7px;
  margin: 8px 0;
  line-height: 1.2;
}

.equip-item-button {
  width: 100%;
  background: rgba(100, 150, 100, 0.9);
  color: #fff;
  border: 2px solid #6f9f6f;
  padding: 6px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.equip-item-button:hover {
  background: rgba(120, 170, 120, 1);
  transform: scale(1.05);
}

/* Unequip All Section */
.unequip-all-section {
  text-align: center;
  margin-top: 20px;
}

.unequip-all-button {
  background: rgba(180, 50, 50, 0.9);
  color: #fff;
  border: 2px solid #d14444;
  padding: 10px 20px;
  font-size: 9px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.unequip-all-button:hover {
  background: rgba(200, 70, 70, 1);
  transform: scale(1.05);
}

/* Equipped Item Details */
.equipped-item-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.equipped-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 2px solid #ffcc00;
  border-radius: 4px;
  background: rgba(59, 45, 38, 0.8);
}

.equipped-item-details .equipped-name {
  color: #ffcc00;
  font-size: 9px;
  font-weight: bold;
  text-shadow: 1px 1px #000;
  margin: 4px 0 !important;
}

.equipped-item-details .equipped-stats {
  color: #4dcfff;
  font-size: 8px;
  text-shadow: 1px 1px #000;
  margin: 0;
}

.equipped-item-details .equipped-description {
  color: #a0a0b0;
  font-size: 7px;
  line-height: 1.2;
  text-align: center;
  margin: 0;
}

.unequip-slot-button {
  width: 100%;
  background: rgba(180, 100, 100, 0.8);
  color: #fff;
  border: 2px solid #ff8888;
  padding: 6px 8px;
  font-size: 8px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-top: 6px;
}

.unequip-slot-button:hover {
  background: rgba(200, 120, 120, 1);
  transform: scale(1.05);
}

.unequip-slot-button:active {
  transform: scale(0.95);
}

/* Equipment Item Card - Add image display */
.equipment-item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.equipment-item-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border: 2px solid #eebb4d;
  border-radius: 4px;
  margin: 8px 0;
  background: rgba(59, 45, 38, 0.8);
}

.equipment-stat-badge {
  color: #4dcfff;
  font-size: 8px;
  font-weight: bold;
  text-shadow: 1px 1px #000;
  margin: 4px 0;
  padding: 4px 8px;
  background: rgba(77, 207, 255, 0.2);
  border-radius: 3px;
}

/* Shop Search and Filter Styles */
.shop-search-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.shop-search-bar {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid #eebb4d;
  border-radius: 4px;
  background: rgba(59, 45, 38, 0.9);
  color: #fff;
  font-family: 'Press Start 2P', cursive;
}

.shop-search-bar::placeholder {
  color: #999;
}

.shop-search-bar:focus {
  outline: none;
  border-color: #4dcfff;
  box-shadow: 0 0 8px rgba(77, 207, 255, 0.4);
}

.shop-filter-dropdown {
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid #eebb4d;
  border-radius: 4px;
  background: rgba(59, 45, 38, 0.9);
  color: #fff;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  min-width: 150px;
}

.shop-filter-dropdown:focus {
  outline: none;
  border-color: #4dcfff;
  box-shadow: 0 0 8px rgba(77, 207, 255, 0.4);
}

.shop-filter-dropdown option {
  background: #3b2d26;
  color: #fff;
  padding: 8px;
}

.shop-display-toggle {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 8px 12px;
  font-size: 12px;
  border: 2px solid #eebb4d;
  border-radius: 4px;
  background: rgba(59, 45, 38, 0.7);
  color: #eebb4d;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(59, 45, 38, 0.95);
  box-shadow: 0 0 8px rgba(238, 187, 77, 0.3);
}

.toggle-btn.active {
  background: #eebb4d;
  color: #3b2d26;
  box-shadow: 0 0 12px rgba(238, 187, 77, 0.5);
  transform: scale(1.05);
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

/* Animation keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Equipment item transitions */
.equipped-item-details {
  animation: fadeIn 0.4s ease-out;
}

.equipment-item-card {
  transition: all 0.3s ease;
}

.equipment-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(238, 187, 77, 0.3);
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  z-index: 999;
  animation: slideInRight 0.4s ease-out;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  max-width: 400px;
  word-wrap: break-word;
}

.notification-toast.success {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  border: 2px solid #2e7d32;
}

.notification-toast.error {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: #fff;
  border: 2px solid #b71c1c;
}

.notification-toast.info {
  background: linear-gradient(135deg, #2196F3 0%, #0b7dda 100%);
  color: #fff;
  border: 2px solid #0d47a1;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(400px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(400px);
  }
}

</style>
